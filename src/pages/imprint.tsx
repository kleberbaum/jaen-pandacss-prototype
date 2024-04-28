import { Field, PageConfig, PageProps } from '@atsnek/jaen';

import { Box } from 'styled-system/jsx';
import { graphql } from 'gatsby';
import * as React from 'react';

const ImprintPage: React.FC<PageProps> = () => {
  return (
    <Box>
      <Field.Editor name="imprint" />
    </Box>
  );
};

export default ImprintPage;

export const pageConfig: PageConfig = {
  label: 'Imprint page',
  icon: 'FaPassport'
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
