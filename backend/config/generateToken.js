const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // sign token with 30days validity based on each id
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn:"30d",
    })
};

module.exports = generateToken;