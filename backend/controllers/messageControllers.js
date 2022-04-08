const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");

// sending messages
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;//chat id of the one in which we send message, and message content; sender is available in auth protect middleware

//  any field empty
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

//   get required info
  var newMessage = {
    sender: req.user._id,//obtained from protect middleware
    content: content,//message
    chat: chatId,//id of chat in which message sent
  };

//   create new message
  try {
    var message = await Message.create(newMessage);//create new message

    message = await message.populate("sender", "name pic");//populate sender name and pic
    message = await message.populate("chat");//chat object
    message = await User.populate(message, {
      path: "chat.users", //populate users inside chat
      select: "name pic email",//name email and pic of users chatting
    });

    // update latest message in chat modal
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,//latest message updated each time message in sent
    });

    res.json(message);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

// fetching all messages
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })//find message with id from param
      .populate("sender", "name pic email")//populate sender details name, pic and email
      .populate("chat");//populate the chat

    res.json(messages);
  } catch (err) {
    res.status(400);
    throw new error(err.message);
  }
});

module.exports = { sendMessage, allMessages };
