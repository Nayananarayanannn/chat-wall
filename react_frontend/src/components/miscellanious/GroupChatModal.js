import {
    Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

function GroupChatModal({ children }) {
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

//   search users with name
  const handleSearch = async (query) => {
    setSearch(query);//search state contains typed letter
    if (!query) {
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

    //   search api call searching user with name or email part with searched letter
      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
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
  };

  const handleSubmit = async () => {
      if(!groupChatName || !selectedUser){
          toast({
              title:'Please Fill all the fields',
              status:'warning',
              duration:5000,
              isClosable:true,
              position:'top'
          });
          return;
      };

      try{
        const config = {
            headers:{
                Authorization:`Bearer ${user.token}`
            }
        }

        const{ data } = await axios.post('/api/chat/group',{
            name:groupChatName,
            users:JSON.stringify(selectedUser.map(u=>u._id))
        },
        config
        );

        setChats([data,...chats]);
        onClose();
        toast({
            title:'New Group Chat Created',
            status:'success',
            duration:5000,
            isClosable:true,
            position:'top'
        })
      }
      catch(err){
        toast({
            title:'failed To Create Chat',
            description:err.response.data,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'top'
        })
      }
  };

//   Add users to be added in new group to selected user array
  const handleGroup = (userToAdd) => {

    // if selected user is already added, throw warning
    if(selectedUser.includes(userToAdd)){
        toast({
            title:'user Already Added',
            status:'warning',
            duration:5000,
            isClosable:true,
            position:'top'
        });
        return;
    }

    // add all selected users to array
    setSelectedUser([...selectedUser,userToAdd])
  };

//   ONCE SELECTED, unselect the user 
  const handleDelete = (delUser) => {
      setSelectedUser(
          selectedUser.filter(sel => sel._id !== delUser._id)
          )
  };
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" d="flex" justifyContent="center">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            <Box
               w='100%'
               d='flex'
               flexWrap='wrap' 
            >
              {/* selected users */}
              {selectedUser.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>

            {/* render searched users  */}
            {loading ? (
              <>
                <Spinner
                  size="md"
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="green.100"
                  color="green.700"
                />
              </>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default GroupChatModal;
