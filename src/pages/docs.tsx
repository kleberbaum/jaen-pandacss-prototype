import { PageConfig } from '@atsnek/jaen';
import { PageProps, graphql } from 'gatsby';
import * as React from 'react';
import TableOfContent from '../components/navigation/TableOfContent';
import useNavOffset from '../hooks/use-nav-offset';
// import MdxEditor from '../components/mdx-editor/MdxEditor';
// import Links from '../components/Links';
// import RightNav from '../components/navigation/RightNav';
// import MainBottomNav from '../components/navigation/MainBottomNav';

// Example links - these would probably be fetched from a CMS or other data source
const links = [
  {
    name: 'Question? Give us feedback',
    href: '/contact'
  },
  {
    name: 'Edit this page on Jaen',
    href: '/cms/pages'
  }
];

const DocsPage: React.FC<PageProps> = () => {
  const navTopOffset = useNavOffset();

  // This can be memoized since it doesn't change and switching pages re-renders most of the app anyway.
  const MemoizedToc = React.memo(TableOfContent, () => false);

  return <div />;
};

export default DocsPage;

export const pageConfig: PageConfig = {
  label: 'Documentation',
  icon: 'FaBook',
  childTemplates: ['DocPage'],
  withoutJaenFrameStickyHeader: true,
  menu: {
    type: 'app',
    order: 100,
    group: 'photonq'
  }
};

export const query = graphql`
  query ($jaenPageId: String!) {
    jaenPage(id: { eq: $jaenPageId }) {
      ...JaenPageData
    }
    allJaenPage(filter: { id: { eq: "JaenPage /docs/" } }) {
      nodes {
        id
        childPages {
          ...JaenPageChildrenData
        }
      }
    }
  }
`;

export { Head } from '@atsnek/jaen';
