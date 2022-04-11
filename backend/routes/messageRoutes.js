const express = require("express");
const { sendMessage, allMessages, notify, fetchNotify } = require("../controllers/messageControllers");
const { protect } = require("../middlewares/authMiddleware");//midleware to get loggedin user authentication
const router = express.Router(); //create router object

router.route("/").post(protect,sendMessage) //sending messages
router.route("/:chatId").get(protect,allMessages); //fetch all message of single chat
router.route('/notification').post(protect,notify);//post notifications on messaging
router.route("/").get(protect,fetchNotify);//fetch all notifications of particular user

module.exports = router;
