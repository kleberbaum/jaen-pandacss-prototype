import { Icon, IconProps } from '~/components/ui';

/**
 * Tabler icon: `search`.
 */
const TbSearch = (props: IconProps) => {
  return (
    <Icon
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
      <path d="M21 21l-6 -6"></path>
    </Icon>
  );
};

export default TbSearch;
