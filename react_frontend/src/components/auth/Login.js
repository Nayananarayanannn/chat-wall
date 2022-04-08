import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  toast,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState();

  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);//display or hide password

  // login with credentials
  const submitHandler = async () => {
    setLoading(true);

    // throw error if any field is empty
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      // seting headers
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // post using axios api call
      const { data } = await axios.post(
        "/api/user/login", //post api
        { email, password }, //post data
        config //headers
      );

      // success message
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      // save loggedin user data in localstorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);
      navigate("/chats");
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
      {/* email */}
        <FormLabel>E-mail</FormLabel>
        <Input
          value={email}
          placeholder="Enter your E-mail"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>

    {/* password */}
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
          {/* hide/sho password */}
            <Button color="black" h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        bg="rgb(24 98 120);"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        className="login"
        isLoading={loading}
      >
        Log In
      </Button>
      <Button
        bg="rgba(0, 100, 100, 0.9)"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={() => {
          setEmail("guest@fsd.com");
          setPassword("12345");
        }}
        className="login"
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
}

export default Login;
