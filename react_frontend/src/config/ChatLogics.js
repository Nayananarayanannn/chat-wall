import { Avatar } from "@chakra-ui/react";

export const getSender = (loggedUser, users) => {
  let user;
  users[0]._id === loggedUser._id ? (user = users[1]) : (user = users[0]); //check in users array logged-in user and return the other user name
  return (
    <>
      <Avatar
        src={user.pic}
        size="xs"
        m={2}
        d={{ base: "none", md: "flex" }}
      />
      {user.name}
    </>
  );
};

export const getSenderName = (loggedUser, users) => {
  return users[0]?._id === loggedUser._id ? users[1]?.name : users[0]?.name;

};

export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// ideally last message send by chating user
export const isSameSender = (message,m,i,userId) =>{//takes in all messages, current message, index of current message and logged in user id
  return (
    i < message.length - 1 && //if new message is inside the message array and not latest one
      (message[i + 1].sender._id !== m.sender._id ||//if next message not send by same user(the one to whom logged in user chats)
    message[i + 1].sender._id === undefined) &&//if next message is undefined(no more message)
      message[i].sender._id !== userId//if message is send by not logged in user
  );
};

// last message by user sending a set of messages
export const isLastMessage = (message, i, userId) => {
  return(
    i === message.length - 1 &&//message is last message
    message[message.length - 1].sender._id !== userId &&//sender is not current logged in user
    message[message.length - 1].sender._id//message exists
  );
};

// setting margins of messages
export const isSameSenderMargin = (message, m, i, userId) => {
  // second last message send by not logged in user
  if (
    i < message.length - 1 &&//message is present in messages array and not last message
    message[i + 1].sender._id === m.sender._id &&//next message is also send by same user
    message[i].sender._id !== userId//message is not send by logged in user
  )
  return 33;//left with litle margin 
  // message is last message by not logged in user
  else if (
    ( i < message.length -1 &&//message is not last one and inside message array
      message[i + 1].sender._id !== m.sender._id && //next message is not send by same user
      message[i].sender._id !== userId ) ||//message not send by logged in user
      (i === message.length - 1 && message[i].sender._id !== userId )//or message is last message and send by other user
  )
  return 0;//no margin as pic also included
  else return 'auto';//extreme right

}

// message send by same user again
export const isSameUser = (message,m,i) => {
  return i > 0 && message[i - 1].sender._id === m.sender._id;//message is not first message and previous message is also send by same user
};

// filter notifications when chat is opened
export const arrayRemove = (arr, value) => {
    return arr.filter(function (ele) {
      return ele != value;
    });
  }