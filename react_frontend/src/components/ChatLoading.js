import { Box, Skeleton, SkeletonCircle, SkeletonText, Stack } from '@chakra-ui/react'
import React from 'react'

function ChatLoading() {
  return (
    <Stack>
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
      <Skeleton startColor="green.400" endColor="blue.500" height="10px" />
    </Stack>
  );
}

export default ChatLoading