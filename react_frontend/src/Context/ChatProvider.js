import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext()//name context

// context api to put states at top
const ChatProvider = ({ children }) =>{//wrap our whole app and children is the whole app
    
    const navigate = useNavigate();

    const [user,setUser] = useState();//user logged in 
    const [selectedChat,setSelectedChat] = useState();//when a chat ids opened
    const [chats,setChats] = useState([]);
    const [notification, setNotification] = useState([])//notification

    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));//parse from stringified
        setUser(userInfo);//user state contains userinfo from localstorage

        // if not logged in
        if(!userInfo){
            navigate('/');
        }

    },[navigate]);
    return(
        <ChatContext.Provider 
            value = {{ user, setUser, selectedChat, setSelectedChat, chats, setChats,notification,setNotification }}
        >
            {children}
        </ChatContext.Provider>
    )
};

export const ChatState = () =>{//all states are inside ChatState variable
    return useContext(ChatContext);//hook to access states in other parts
}


export default ChatProvider;