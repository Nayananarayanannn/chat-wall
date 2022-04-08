const express = require("express");
const { registerUser,authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();//create router object

router.route('/').post(registerUser).get(protect, allUsers);//signup route and user redirecting
router.route('/login').post(authUser);//login route


module.exports = router;
