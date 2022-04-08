import { ViewIcon } from "@chakra-ui/icons";
import {
    Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

function UpdateGroupChatModal({ fetchAgain, setFetchAgain,fetchMessages }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName ] = useState();
  const [search,setSearch] = useState("");
  const [searchResult,setSearchResult] = useState([]);
  const [loading,setloading] = useState(false);
  const [renameLoading,setRenameLoading] =useState(false);

  const toast = useToast();

  const{ selectedChat, setSelectedChat,user } =ChatState();

//   remove user from group
  const handleRemove = async (user1) => {

    // loggedin user must be group admin, or the user to be removed is logged in user itself
    if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
         toast({
           title: "Only Admin can Add members",
           description:
             "You Are not Authorized to Add New Member to this group",
           status: "error",
           duration: 5000,
           isClosable: true,
           position: "top",
         });
         return;
    }
    
    try{
        setloading(true);

        const config = {
            headers:{
                Authorization: `Bearer ${user.token}`,
            },
        };

        const { data } = await axios.put('/api/chat/groupremove',
            {
                chatId:selectedChat._id,//find chat by id of selected group
                userId: user1._id,//find user by id of selected user
            },
            config
        );

        user1._id === user._id ? setSelectedChat() : setSelectedChat(data);//if user removing himself load page without selected group chat

        setFetchAgain(!fetchAgain);//fetch chats again to display updated chats 
        fetchMessages();//All messages refresh on removing someone from group
        setloading(false);

    }
    catch(err){
        toast({
            title:'Error Occured',
            description:err.response.data.message,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'top'
        })
    }
  }

//   rename the group
  const handleRename = async () => {
    //   if rename field is empty show warning
      if(!groupChatName) {
          toast({
            title:'Type New Group-name',
            status:'warning',
            duration:5000,
            isClosable:true,
            position:'top'
        })
        return;
    };

      try{
        setRenameLoading(true);

        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };

        // api call put request
        const { data } = await axios.put('/api/chat/rename',{
            chatId: selectedChat._id,//find the chat with id
            chatName:groupChatName,//new chat name
        },
        config
        );

        setSelectedChat(data);//selected chat is updated with new name
        setFetchAgain(!fetchAgain);//set fetchAgain true to reload side chat list with new name
        setRenameLoading(false)
      }
      catch(err){
        //   throw error message
        toast({
            title:'Error Occured!',
            description:err.response.data.message,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'top'
        });

        setRenameLoading(false);
      }

    //   state variable set back to empty after renaming
      setGroupChatName('')
  }

//   search users
  const handleSearch = async (query) => {
      setSearch(query);//search state contains typed letter
    if (!query) {
      return;
    }

    try {
      setloading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

    //   search api call searching user with name or email part with searched letter
      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setloading(false);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: "Error Occured",
        description: "failed to Load the search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  }

//   Add new user to group chat
  const handleAddUser = async (user1) => {

    // if user already in group throw warning message
      if(selectedChat.users.find(u => u._id === user1._id)) {
          toast({
              title:'User Already in Group!',
              status:'warning',
              duration:5000,
              isClosable: true,
              position:'top'
          });
          return;
      }

    //   if not admin, cant add user to group
      if(selectedChat.groupAdmin._id !== user._id){
          toast({
              title:'Only Admin can Add members',
              description:'You Are not Authorised to Add New Member to this group',
              status:'error',
              duration:5000,
              isClosable:true,
              position:'top'
          });
          return;
      }

      try{
        setloading(true);

        const config ={
            headers:{
                Authorization:`Bearer ${user.token}`,
            },
        };

        // api call to update chat by adding new user
        const { data } = await axios.put('/api/chat/groupadd',{
            chatId:selectedChat._id,//find chat selected using id
            userId:user1._id,//add user with id to users array
        },
        config
        );

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);//fetch chat again so that new user is displayed
        setloading(false);
      }
      catch(err){
        toast({
            title:'error occured',
            description:err.response.data.message,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'top'
        });
        setloading(false);
      }
  }

  return (
    <>
      {/* modal opens on clicking eye icon */}
      <IconButton
        color="black"
        d={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      {/* group modal */}
      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            d="flex"
            justifyContent="center"
            fontFamily="indie flower"
          >
            <u>{selectedChat.chatName}</u>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>

          {/* Specifies Admin */}
          <Text
            color='teal'
            fontWeight='bold'
            p={2}
          > Group Admin: {selectedChat.groupAdmin.name}</Text>
            {/* display users in group */}
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            {/* rename group */}
            <FormControl d="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Rename
              </Button>
            </FormControl>
            {/* search user to be added to group */}
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner
                size="md"
                thickness="4px"
                speed="0.65s"
                emptyColor="green.100"
                color="green.700"
              />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            {/* current logged-in user can leave the group */}
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateGroupChatModal;
