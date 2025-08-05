import React, { useState } from 'react';
import axios from 'axios';
import { RxCross2 } from "react-icons/rx";
import { Flex, Text } from '@mantine/core';

import '../../index.css';
const ChatsSummary = ({ summary, loading, setOpenChatSummary }) => {

  return (
    <div className={`chatSummary-container ${!loading ? 'open' : ''}`}>
      <div>
        <RxCross2 color='white' onClick={() => setOpenChatSummary(false)} />
      </div>
      <div>
        <Flex direction={'column'} gap="md" justify="center" align="center">
          <Text fw={600} size='20px'>Summary</Text>
          <Text>{summary}</Text>
        </Flex>
      </div>
    </div>
  );
};

export default ChatsSummary;
