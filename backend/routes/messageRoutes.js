const express = require("express");
const { sendMessage, allMessages } = require("../controllers/messageControllers");
const { protect } = require("../middlewares/authMiddleware");//midleware to get loggedin user authentication
const router = express.Router(); //create router object

router.route("/").post(protect,sendMessage) //sending messages
router.route("/:chatId").get(protect,allMessages); //fetch all message of single chat

module.exports = router;
