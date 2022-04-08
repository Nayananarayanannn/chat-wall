import { Box } from "@chakra-ui/react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import SideDrawer from "../components/miscellanious/SideDrawer";
import MyChats from "../components/MyChats";
import { ChatState } from "../Context/ChatProvider"

function ChatPage() {
    
    const { user } = ChatState();//take state from context api
    const[fetchAgain,setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {/* header portion which onclick searches user */}
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {/* chat lists at left side */}
        {user && (
          <MyChats fetchAgain={fetchAgain}/>
        )}
        {/* main chatbox at middle */}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
}

export default ChatPage