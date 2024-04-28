import { PageConfig } from '@atsnek/jaen';
import { PageProps, graphql } from 'gatsby';
import * as React from 'react';

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

const DocPage: React.FC<PageProps> = props => {
  return <div />;
};

export default DocPage;

export { Head } from '@atsnek/jaen';

export const pageConfig: PageConfig = {
  label: 'DocPage',
  childTemplates: ['DocPage'],
  withoutJaenFrameStickyHeader: true
};

export const query = graphql`
  query ($jaenPageId: String!) {
    jaenPage(id: { eq: $jaenPageId }) {
      ...JaenPageData
      childPages {
        ...JaenPageChildrenData
      }
    }
  }
`;
