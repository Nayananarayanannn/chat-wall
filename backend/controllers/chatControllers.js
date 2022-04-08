const asyncHandler = require("express-async-handler");
const Chat = require('../Models/chatModel');
const User = require("../Models/userModel");

// access a particular chat
const accesschat = asyncHandler( async(req,res) => {
    const { userId } = req.body;//id of user to which chat is started

    // if userId  ot send, log error message
    if(!userId) {
        console.log("User param not sent with request");
        return res.sendStatus(400);
    }

    // find chat details
    var isChat = await Chat.find({
        isGroupChat: false,//find one to one chat

        // find chat with specified sender and receiver
        $and:[
            {users:{ $elemMatch:{$eq:req.user._id}}},//id of sender logged in with token
            {users: { $elemMatch:{$eq:userId}}}//id of user to which message is to be sent
        ]
    }).populate("users","-password")//in chat db populate user details from users db
        .populate("latestMessage");//in chat db populate latest message from message db

        // populate user db with sender name pic and email
        isChat = await User.populate(isChat,{
            path: 'latestMessage.sender',
            select: "name pic email",
        });
      
        // if chat already exists, return it from db
        if(isChat.length > 0){
            res.send(isChat[0]);
        } 

        // if chat doesnot exists create new one
        else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id,userId],
            };

            try{
                 const createdChat = await Chat.create(chatData);//create new chat

                //  get user details from user db 
                const fullChat = await Chat.findOne({ _id:createdChat._id })
                .populate("users","-password");

                res.status(200).send(fullChat);
            } catch(err) {
                res.status(400);
                throw new Error(err.message);
            }
        }
});

// fetch all chats of logged in user
const fetchChats = asyncHandler(async (req,res)=>{
    try{
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})//find from db users having id of logged in user
            .populate("users","-password")//populate user array
            .populate("groupAdmin","-password")//populate groupadmin
            .populate("latestMessage")//populate latest messages
            .sort({updatedAt : -1})//sort messages new to old
            .then(async (results) => {
                results = await User.populate(results,{
                    path:"latestMessage.sender",//populate sender name pic and email
                    select:"name pic email",
                });

                res.status(200).send(results);
            });
    }
    catch(err){
        res.status(400);
        throw new Error(err.message);
    }
});

// Create a new group chat
const createGroupChat = asyncHandler(async (req,res) => {
    // send error if any field is empty
    if(!req.body.users || !req.body.name){
        return res.status(400).send({ message: "Please Fill all the fields" })
    }

    // get all users added
    var users = JSON.parse(req.body.users);//stringified array from frontend parsed to object

    // if number of users added is less than 2 error send
    if(users.length < 2){
        return res
            .status(400)
            .send("More than two users required to form a group chat")
    } 

    users.push(req.user);//current logged in user is a member of group chat if created by him

    // create group chat in db
    try{
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,//group admin is currently logged-in user by default
        });

        // find the created group chat from db
        const fullGroupChat = await Chat.findOne({ _id:groupChat.id })
            .populate("users","-password")//populate users array
            .populate("groupAdmin","-password");//populate group admin details 

        res.status(200).json(fullGroupChat);
    }
    catch(err){
        res.status(400);
        throw new Error(err);
    }
})

// rename existing group chat
const renameGroup = asyncHandler(async (req,res)=>{
    const { chatId,chatName } = req.body;//id of chat to be renamed and new name

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,//query
        {
            chatName:chatName//update
        },
        {
            new:true,//if not given returns old name
        }
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

        // error handling
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
    }
    else{
        res.json(updatedChat);
    }
})

// add new user to existing group
const addToGroup = asyncHandler(async (req,res)=>{
    const{ chatId,userId } = req.body;//get user Id of user to be added and chat Id of group chat

    const added = await Chat.findByIdAndUpdate(
        chatId,//query (find chat to be updated)
        {
            $push: { users:userId },//push new user with id into the users array
        },
        { new:true }
    )
        .populate("users","-password")
        .populate("groupAdmin","-password");

    if(!added){
        res.status(400);
        throw new Error("Chat Not found");
    }
    else{
        res.json(added);
    }
});

// remove user from group
const removeFromGroup = asyncHandler(async(req,res)=>{
    const { chatId,userId } = req.body;//user id of user to be removed and group from which to be removed

    const removed = await Chat.findByIdAndUpdate(
        chatId,//query
        {
            $pull: { users:userId }//pull particular user out of users array
        },
        { new:true }
        )
            .populate("users","-password")
            .populate("groupAdmin","-password")

        if(!removed){
            res.status(400);
            throw new Error("Chat Not Found")
        }
        else{
            res.json(removed)
        }
})

module.exports = { accesschat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup }