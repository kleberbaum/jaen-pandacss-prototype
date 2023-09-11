import { sq } from "@snek-functions/origin";
import { TStoreSlice, TStoreState } from "../../../shared/types/store";
import { TCommunityPostsSlice } from "../types/communityPostsState";
import { produce } from "immer";
import { TPostPreview, TPostPrivacy } from "../types/post";
import { Post } from "@snek-functions/origin/dist/schema.generated";
import { formatPostDate } from "../../../shared/utils/features/post";
import { useAppStore } from "../../../shared/store/store";


export const createCommunityPostsSlice: TStoreSlice<TCommunityPostsSlice> = (set) => ({
    featuredPosts: { state: 'loading', posts: [] },
    latestPosts: { state: 'loading', posts: [] },
    searchPosts: { state: 'inactive', posts: [] },
    fetchFeaturedPosts: async () => {
        set(produce((state: TStoreState) => {
            state.communityPosts.featuredPosts.state = 'loading';
        }))
        const [posts, error] = await sq.query(q => q.allSocialPostTrending({ filters: { limit: 4, offset: 0 } }));
        const currentUser = useAppStore.getState().currentUser.userMe;

        if (error) return;
        const featuredPosts = posts.filter(p => p !== null).map((p): TPostPreview => {
            // const profile = await sq.query(q => q.user({ id: p.profileId })
            const post = p as Post;
            return {
                id: post.id,
                title: post.title,
                summary: post.summary,
                avatarUrl: post.avatarURL,
                createdAt: formatPostDate(post.createdAt),
                privacy: post.privacy as TPostPrivacy,
                profileId: post.profileId,
                stars: post.stars?.length ?? 0,
                canManage: false, //TODO: Implement this
            }
        });

        console.log("trending posts: ", posts);
        set(produce((state: TStoreState) => {
            state.communityPosts.featuredPosts.state = 'success';
            state.communityPosts.featuredPosts.posts = featuredPosts;
        }))
    },
    fetchLatestPosts: async () => {
        set(produce((state: TStoreState) => {
            state.communityPosts.latestPosts.state = 'loading';
        }));

        const [posts, error] = await sq.query(q => q.allSocialPost({ filters: { limit: 4, offset: 0 } }));

        if (error) return;
        // fetch trending posts

        const latestPosts = posts.filter(p => p !== null).map((p): TPostPreview => {
            const post = p as Post;
            return {
                id: post.id,
                title: post.title,
                summary: post.summary,
                avatarUrl: post.avatarURL,
                createdAt: formatPostDate(post.createdAt),
                privacy: post.privacy as TPostPrivacy,
                profileId: post.profileId,
                stars: post.stars?.length ?? 0,
                canManage: false, //TODO: Implement this
            }
        })

        console.log("latest posts: ", posts);
        set(produce((state: TStoreState) => {
            state.communityPosts.latestPosts.state = 'success';
            state.communityPosts.latestPosts.posts = latestPosts;
        }));
    },
    fetchSearchPosts: async (query: string) => {
        // fetch search posts
    },
});