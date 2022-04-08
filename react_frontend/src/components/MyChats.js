import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellanious/GroupChatModal";

// side section displaying all chats with chat name
function MyChats({ fetchAgain }) {

  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  // fetch particular chat
  const fetchChats = async () => {
    try {
      // auth headers
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // get request
      const { data } = await axios.get("/api/chat", config);

      console.log(data);
      setChats(data);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: err.message,
        status: "error",
        isClosable: true,
        position: "top",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));//logged user is logged-in user
    fetchChats();
  }, [fetchAgain]);//whenever fetchAgain changes, fetchChat again
  
  return (
    // if chat is selected my chats disapears for small screen
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="rgba(24,98,120,0.8)"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      borderColor='black'
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="white"
      >
        My Chats
        {/* create new groupchat button */}
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            color="black"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* chatlist box */}
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="rgba(0,0,0,0.2)"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="auto">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#1d6d7a" : "rgba(0,0,0,0.3)"}
                color={selectedChat === chat ? "white" : "white"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                {/* if group chat set group name as heading, else set sender name as heading */}
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}

export default MyChats;
