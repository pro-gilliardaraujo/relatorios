import { Box, Tabs, TabList, TabPanels, TabPanel, Tab } from '@chakra-ui/react';
import ExcelUpload from './ExcelUpload';
import ImagePaste from './ImagePaste';

export default function FileUploadContainer() {
  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="gray">
        <TabList>
          <Tab>Upload de Excel/CSV</Tab>
          <Tab>Imagens</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ExcelUpload />
          </TabPanel>
          <TabPanel>
            <ImagePaste />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 