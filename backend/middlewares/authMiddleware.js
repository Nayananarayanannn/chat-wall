const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req,res,next) => {
    let token;

    if(
        req.headers.authorization &&//authorization header is set
        req.headers.authorization.startsWith("Bearer")//only bearer token allowed
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];//take token only leaving bearer part

            // decodes token id
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");//find user using generated token and save in user variable

            next();
        } catch(error) {
            res.status(401);
            throw new error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token")
    }
});

module.exports = { protect };