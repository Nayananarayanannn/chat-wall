const express = require("express");
const { accesschat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require("../controllers/chatControllers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router(); //router object

router.route("/").post(protect, accesschat);//create a new chat with particular user
router.route("/").get(protect, fetchChats);//get all chats
router.route("/group").post(protect, createGroupChat);//create new group chat
router.route("/rename").put(protect, renameGroup);//put request to rename group
router.route("/groupremove").put(protect, removeFromGroup);//put request to update group by removing a user
router.route("/groupadd").put(protect, addToGroup);//put request to update group by adding new user

module.exports = router;
