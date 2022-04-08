import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  toast,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender, getSenderName } from "../../config/ChatLogics";
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';

function SideDrawer() {
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { user,setSelectedChat,chats,setChats,notification,setNotification } = ChatState();

  // drawer
  const { isOpen, onOpen, onClose } = useDisclosure();

  // logout functionality
  const logoutHandler = () => {
    localStorage.removeItem("userInfo"); //remove user from localstorage
    navigate("/"); //get back to login page
  };

  // search for user
  const handleSearch = async () => {

    // if search field empty throw warning message
    if (!search) {
      toast({
        title: "Please Enter name, email or part of it to search User",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      // set header as token
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // api call using axios
      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      // save results in searchResult
      setSearchResult(data);
    } 
    // in case of error throw error as toast
    catch (err) {
      toast({
        title: "Error occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  // access chat on click(if chat not exist create new chat)
  const accessChat = async (userId)=>{
   try{
      setLoadingChat(true)

      // post headers
      const config = {
        headers: {
          'Content-Type':'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // post api
      const {data} =await axios.post('/api/chat', {userId},config);

      // if chat is found already, it just update list by appending chat
      if(!chats.find((c) => c._id === data._id)){
        setChats([data,...chats])
      }
      // save received result
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();//close the side drawer once chat selected
   }
   catch(err){
      toast({
        title:'Error fetching the chat',
        description:err.message,
        status:'error',
        duration:5000,
        isClosable:true,
        position:'top-left',
      })
   }
  }

  return (
    <div className="sideDrawer">
      <Box
        color="white"
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="rgba(24,98,120,0.8);"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
        borderColor="rgb(2, 23, 55)"
      >
        {/* search */}
        <Tooltip hasArrow placement="bottom" label="Search Users to chat">
          <Button onClick={onOpen} variant="ghost">
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        {/* mid title */}
        <Text fontSize="2xl" fontFamily="Indie Flower">
          Chat Wall
        </Text>

        <div>
          {/* bell icon for notification */}
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList color="black" p={2} pl={4} fontWeight="bold">
              {!notification.length && "No New messages"}
              {notification.map((notify) => (
                <MenuItem
                  color="black"
                  p={2}
                  pl={4}
                  fontWeight="bold"
                  key={notify._id}
                  onClick={() => {
                    setSelectedChat(notify.chat);
                    setNotification(notification.filter((n) => n !== notify));
                  }}
                >
                  {notify.chat.isGroupChat
                    ? `New message in ${notify.chat.chatName}`
                    : `New message from ${getSenderName(
                        user,
                        notify.chat.users
                      )}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* profile  */}
          <Menu>
            <MenuButton
              color="black"
              backgroundColor="rgba(1000,1000,1000,0.6)"
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >
              {/* profile pic  */}
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList backgroundColor="rgba(1000,1000,1000,0.9)">
              <ProfileModal user={user}>
                <MenuItem color="black">My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler} color="black">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px"> Search Users </DrawerHeader>

          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              ></Input>
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {/* search results */}
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && (
              <Spinner
                size="md"
                thickness="4px"
                speed="0.65s"
                emptyColor="green.100"
                color="green.700"
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default SideDrawer;
