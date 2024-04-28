import { PageConfig, PageProps } from '@atsnek/jaen';
import { Global } from '@emotion/react';

import { graphql } from 'gatsby';
import Hero from '../components/sections/Hero';


const IndexPage: React.FC<PageProps> = () => {
  return (
    <>
      {/* <Global
        styles={{
          body: {
            backgroundColor: '#0D0E11'
          }
        }}
      /> */}

      <Hero />
     
    </>
  );
};

export default IndexPage;

export const pageConfig: PageConfig = {
  label: 'Home Page',
  icon: 'FaHome',
  childTemplates: ['BlogPage']
};

export const query = graphql`
  query ($jaenPageId: String!) {
    ...JaenPageQuery
    allJaenPage {
      nodes {
        ...JaenPageData
        children {
          ...JaenPageData
        }
      }
    }
  }
`;

export { Head } from '@atsnek/jaen';
