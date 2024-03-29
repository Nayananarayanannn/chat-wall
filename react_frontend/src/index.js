import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ChatProvider from "./Context/ChatProvider";

ReactDOM.render(
  
    <BrowserRouter>
    <ChatProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
  </ChatProvider>
    </BrowserRouter>,
  document.getElementById("root")
);
