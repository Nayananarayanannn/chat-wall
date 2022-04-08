import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellanious/ProfileModal";
import UpdateGroupChatModal from "./miscellanious/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { useLottie } from "lottie-react";
import gif from "../animations/86723-typing-animation.gif";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";//endpoint uil(localhost 5000 before deploy)
var socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const { user, selectedChat, setSelectedChat,notification,setNotification } = ChatState();

  const toast = useToast();

  const [message, setMessage] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState();
  const [socketconnected, setSocketconnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // fetch all message sof selected chat
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, //Auth
        },
      };

      // show loading symbol
      setloading(true);

      // Api Call
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      // get all messages in Message array
      setMessage(data);
      setloading(false);

      // emit signal to join room
      socket.emit("join chat", selectedChat._id);//new room created with selected chat id
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        isClosable: true,
        position: "top",
        duration: 5000,
      });
    }
  };

  // start socket.io
  useEffect(() => {
    socket = io(ENDPOINT);//start socket connection
    socket.emit("setup", user);//emit event setup, logged in user send
    socket.on("connected", () => {//on event connected is called
      setSocketconnected(true);//socket connected
    });
    // typing events
    socket.on("typing", () => setIsTyping(true));//on receiving typing event, set is typing to true
    socket.on("stop typing", () => setIsTyping(false));//on receiving stoptyping signal, set istyping to false
  }, []);

  // fetch message on reload and whenever user change selected chat
  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;//get a backup of selected chat to compare and emit message or send notification if not selected
  }, [selectedChat]);

  useEffect(() => {
    // on receiving message
    socket.on("message received", (newmessageReceived) => {
      if (
        !selectedChatCompare ||//no chats selected
        selectedChatCompare._id !== newmessageReceived.chat._id//selected chat and message received is different chats
      ) {
        // give notification
        if(!notification.includes(newmessageReceived))//if notification array doesnot include the new message received
          setNotification([newmessageReceived,...notification]);
          setFetchAgain(!fetchAgain);
      } 
      // if message received chat is already selected
      else {
        setMessage([...message, newmessageReceived]);//add new chat to list of messages
      }
    });
  });
  // send messages
  const sendMessage = async (e) => {
    // send message on press enter
    if (e.key === "Enter" && newMessage) {
      
      socket.emit("stop typing", selectedChat._id);//stop tying after sending message in selected chat room

      try {
        const config = {
          headers: {
            "Content-Type": "application/json", //as post request
            Authorization: `Bearer ${user.token}`,
          },
        };

        // immediately reflect in UI(empty field) when enter press
        setnewMessage("");

        //  API Call
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);//send new message event with message from api call

        setMessage([...message, data]); //Add each message to previous messages
      } catch (err) {
        // error handling
        toast({
          title: "Error Occured!",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  // function run whenever a key is pressed
  const typingHandler = (e) => {
    setnewMessage(e.target.value);

    // Typing Indicator Logic
    if (!socketconnected) return;//if socket not connected

    // if typing is false, set to true as function is called only onchange
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);//emit typing event in selected chat room
    }

    // stop typing 5 seconds after user is not typing anything
    let lasttypingTime = new Date().getTime();//last time typing
    var timerlength = 5000;//5 secs

  // call set time out after each 5 second of typing
    setTimeout(() => {
      var timeNow = new Date().getTime();//present time
      var timeDiff = timeNow - lasttypingTime;

      if (timeDiff >= timerlength && typing) {//if time diff is more than 5sec and typing is already set to true
        socket.emit("stop typing", selectedChat._id);//emit stop typing event with selected chat room
        setTyping(false);//typing set to false
      }
    }, timerlength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            {/* on icon click set selected chat none so that small screen displays chats list */}
            <IconButton
              color="black"
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            bg="rgba(0,0,0,0.2)"
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {/* messages appear */}
            {loading ? (
              <Spinner
                size="xl"
                thickness="4px"
                alignSelf="center"
                margin="auto"
                speed="0.65s"
                emptyColor="green.100"
                color="green.700"
              />
            ) : (
              <div className="messages">
                <ScrollableChat message={message} />
                {console.log(message)}
              </div>
            )}

            {/* input for messaging */}
            {/* send message on keyDown of enter key */}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
            {/* if typing display typing indicator */}
              {isTyping ? (
                <div>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="10 0 5000 200"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                  >
                    <path id="path">
                      <animate
                        attributeName="d"
                        from="m0,110 h0"
                        to="m0,110 h850"
                        dur="1.8s"
                        begin="0s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <text font-size="200" font-family="Montserrat" fill="white">
                      <textPath
                        xlinkHref="#path"
                      >
                        ...Typing...
                      </textPath>
                    </text>
                  </svg>
                </div>
              ) : (
                <></>
              )}

              <Input
                variant="filled"
                placeholder="Enter You Message..."
                onChange={typingHandler}
                value={newMessage}
                bg="rgba(0,0,0,0.3)"
                _hover={{ bg: "rgba(0,0,0,0.5)" }}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3}>
            Click On a User To Start Chatting
          </Text>
        </Box>
      )}
    </>
  );
}

export default SingleChat;
