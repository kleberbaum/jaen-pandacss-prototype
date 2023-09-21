import { TProfile } from "../types/user";
import { sq } from "@snek-functions/origin";
import { produce } from "immer";
import { TStoreSlice, TStoreState } from "../../../shared/types/store";
import { TProfileSlice } from "../types/profileState";
import { buildUserActivities, changeUserFollowingState } from "../utils/user";
import { useAppStore } from "../../../shared/store/store";
import { buildPostPreview, searchPosts, togglePostRating } from "../../../shared/utils/features/post";
import { TPostListData } from "../../post/types/post";

export const createProfileSlice: TStoreSlice<TProfileSlice> = (set, get) => ({
    activity: [],
    overviewPosts: { state: "loading", posts: [] },
    searchPosts: { state: "inactive", posts: [] },
    followers: 0,
    isFollowing: undefined,
    profile: undefined,
    fetchProfile: async (username) => {
        let isFollowing: boolean | undefined = undefined;
        let followers: number = 0;

        const [currentUser, currentUserError] = await sq.query(q => q.userMe);

        const [userData, error] = await sq.query((q): TProfile['user'] | undefined => {
            const user = q.user({ resourceId: __SNEK_RESOURCE_ID__, login: username })
            const profile = user.profile;

            if (!currentUserError && currentUser && currentUser.id !== user.id) {
                isFollowing = !!profile?.followers && profile?.followers()?.nodes.findIndex(f => f.follower.id === currentUser.id) !== -1;
            }

            if (profile?.followers) {
                followers = profile.followers().totalCount;
            }

            return {
                id: user.id,
                avatarUrl: user.details?.avatarURL ?? '',
                bio: profile?.bio ?? null,
                displayName: `${user.details?.firstName ?? ''} ${user.details?.lastName ?? ''}`,
                socials: [],
                username: username,
            }
        })

        if (error || !userData) return false;

        set(produce((state: TStoreState): void => {
            state.profile.profile = userData;
            state.profile.isFollowing = isFollowing;
            state.profile.followers = followers;
        }))
        return true;
    },
    fetchOverviewPosts: async () => {
        if (!get().profile.profile) return false;

        const [currentUser,] = await sq.query(q => q.userMe);

        const userId = get().profile.profile?.id;
        const [rawPosts, error] = await sq.query(q => {
            const posts = q.allSocialPostTrending({ filters: { limit: 6, offset: 0, profileId: userId } });
            posts?.nodes.map(p => {
                for (const key in p) {
                    p[key as keyof typeof p];
                }
                p.stars().nodes.map(s => {
                    s.profile?.id;
                })
                p.stars().totalCount;
            })
            return posts;
        })

        const posts = await Promise.all(rawPosts?.nodes.filter(
            ({ privacy }) =>
                privacy === 'PUBLIC' ||
                (!!currentUser && userId === currentUser.id)
        )
            .map(async p => {
                return (await sq.query(q => buildPostPreview(q, p, currentUser)))[0]
            }) ?? [])


        set(produce((state: TStoreState): void => {
            state.profile.overviewPosts = {
                state: "success",
                posts
            };
        }))
        return !!error;
    },
    fetchActivity: async () => {
        if (!get().profile.profile) return false;

        const [currentUser,] = await sq.query(q => q.userMe);

        const [, error] = await sq.query(q => {
            const user = q.user({ resourceId: __SNEK_RESOURCE_ID__, login: get().profile.profile?.username })
            const profile = user.profile;

            set(produce((state: TStoreState): void => {
                state.profile.activity = buildUserActivities(q, profile?.activity().nodes ?? [], currentUser);
            }))
        })

        return !!error;
    },
    fetchSearchPosts: async (query, limit, offset) => {
        if (!query.length) {
            set(produce((state: TStoreState): void => {
                state.profile.searchPosts = {
                    state: "inactive",
                    posts: [],
                };
            }))
            return;
        }

        set(produce((state: TStoreState) => {
            state.profile.searchPosts.state = "loading";
        }))

        const [currentUser,] = await sq.query(q => q.userMe);
        const currentProfile = useAppStore.getState().profile.profile;
        if (!currentProfile) return;

        const publicPosts = await searchPosts(query, Math.ceil(limit / 2), "PUBLIC", get().profile.searchPosts.publicPageInfo?.cursor, currentUser, currentProfile?.id);

        let privatePosts: TPostListData = { state: "inactive", posts: [] }
        if (currentUser && currentUser?.id === currentProfile.id) {
            privatePosts = await searchPosts(query, Math.ceil(limit / 2), "PRIVATE", get().profile.searchPosts.privatePageInfo?.cursor, currentUser, currentProfile?.id);
        }

        const combinedPosts = [...publicPosts.posts, ...privatePosts.posts];

        set(
            produce((state: TStoreState): void => {
                state.profile.searchPosts = {
                    state: "success",
                    posts: offset === 0
                        ? combinedPosts
                        : [...state.profile.searchPosts.posts, ...combinedPosts],
                    hasMore: publicPosts.hasMore || privatePosts.hasMore,
                    privatePageInfo: {
                        cursor: privatePosts.cursor,
                        hasNextPage: privatePosts.hasMore,
                    },
                    publicPageInfo: {
                        cursor: publicPosts.cursor,
                        hasNextPage: publicPosts.hasMore,
                    },
                    totalCount: (publicPosts.totalCount ?? 0) + (privatePosts.totalCount ?? 0),
                }
            })
        );
    },
    toggleFollow: async () => {
        const [currentUser,] = await sq.query(q => q.userMe);
        const [currentProfile, profileError] = await sq.query(q => q.user({ resourceId: __SNEK_RESOURCE_ID__, id: get().profile.profile?.id }))

        if (profileError || !currentUser || !currentProfile.id || (currentUser && currentUser.id === currentProfile.id)) return false;

        const succeed = await changeUserFollowingState(currentProfile.id, get().profile.isFollowing ?? false);

        if (succeed) {
            set(produce((state: TStoreState): void => {
                state.profile.isFollowing = !get().profile.isFollowing;
                state.profile.followers += get().profile.isFollowing ? -1 : 1;
            }))
        }

        return succeed;
    },
    changeBio: async (bio) => {
        if (!get().profile.profile) return false;
        if (bio === get().profile.profile?.bio) return true;
        const [, err] = await sq.mutate(m => m.socialProfileUpdate({ values: { bio } }));

        const succeed = !err || err.length === 0;

        if (succeed) {
            set(produce((state: TStoreState): void => {
                state.profile.profile!.bio = bio;
            }))
        }

        return succeed;
    },
    togglePostRating: async (id, source) => {
        const hasRated = source === 'overview' ? get().profile.overviewPosts.posts.find(p => p.id === id)?.hasRated : get().profile.searchPosts.posts.find(p => p.id === id)?.hasRated;

        if (hasRated === undefined) return false;

        const succeed = await togglePostRating(id, hasRated ?? false);

        if (succeed) {
            set(produce((state: TStoreState) => {
                if (source === 'overview') {
                    const post = state.profile.overviewPosts.posts.find(p => p.id === id);
                    if (post) {
                        post.hasRated = !post.hasRated;
                        post.stars += post.hasRated ? 1 : -1;
                    }
                } else {
                    const post = state.profile.searchPosts.posts.find(p => p.id === id);
                    if (post) {
                        post.hasRated = !post.hasRated;
                        post.stars += post.hasRated ? 1 : -1;
                    }

                }
            }))
        }

        return succeed;
    },
})