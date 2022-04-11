const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notfound, errorhandler } = require("./middlewares/errorMiddleware");
const path = require("path");

dotenv.config(); //to access from .env

connectDB(); //DB connections

const app = express();

app.use(express.json()); //to accept JSON data

// Routes
app.use("/api/user", userRoutes); //login and signup routes
app.use("/api/chat", chatRoutes); //one to one and group chat CRUDs
app.use("/api/message", messageRoutes); //SocketIO message routes

// -----------------Deployment Codes----------------
const __dirname1 = path.resolve();
if ( process.env.NODE_ENV === 'production') {
  console.log(path.join(__dirname1, "/react_frontend/build"));
  app.use(express.static(path.join(__dirname1, "/react_frontend/build"))); //set build forlder

  // get index page whenever app runs
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "react_frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API Running Successfully");
  });
}

// ----------------Deployment Codes------------------

app.use(notfound);
app.use(errorhandler);

// server running port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log("server running ...")); //save server in a variable

// ----------------SOCKET.IO------------------------------

// initialize
const io = require("socket.io")(server, {
  pingTimeout: 60000, //waits 60 seconds and close connection to save band width if user is inactive
  // cors origin set
  cors: {
    origin: "http://localhost:3000",
  },
});

// create a connection
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  // create new socket where frontend send data and create ne room
  socket.on("setup", (userData) => {
    socket.join(userData._id); //new room exclusive to particular user
    console.log(userData._id);
    socket.emit("connected"); //emit connected event
  });

  // create join chat socket
  socket.on("join chat", (room) => {
    //join chat
    socket.join(room); //create a room with each chat
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing")); //inside of room emit typing event(room=selected chat)
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing")); //inside room emit stoptyping event

  // send new message
  socket.on("new message", (newmessageReceived) => {
    var chat = newmessageReceived.chat; //chat in which message belong to

    if (!chat.users) return console.log("chat.users not defined"); //if chat doesnt have any users

    chat.users.forEach((user) => {
      if (user._id == newmessageReceived.sender._id) return; //if message send by logged in user just return

      socket.in(user._id).emit("message received", newmessageReceived); //sending message received event to logged in user room
    });
  });

  // clean socket when user leave(or log off,as userdata is not there)
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
