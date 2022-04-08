import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function Signup() {

  const [show, setShow] = useState(false);//show/hide password button
  const [showconfirm, setShowconfirm] = useState(false);//show/hide confirm masspord button
  const [name, setName] = useState();//username
  const [email, setEmail] = useState();//user email
  const [confirmpassword, setConfirmpassword] = useState();//confirm password
  const [password, setPassword] = useState();//password
  const [pic, setPic] = useState();//profile pic
  const [loading, setLoading] = useState(false);//show loading indicator

  const toast = useToast();//chakra ui toast
  const navigate = useNavigate();//navigate to pages

  const handleClick = () => setShow(!show);//function to show/hide passsword
  const handleClickConfirm = () => setShowconfirm(!showconfirm);//function to show/hide confirm password

  // post profile picture
  const postDetails = (pics) => {
    setLoading(true);//loading indicator until picture is uploaded

    // if no pic added, show warning
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // add pic only of prefered image formats
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-wall");//name of app specified in cloudinary
      data.append("cloud_name", "nayananarayanan");//user name from cloudinary

      // post uploaded image to cloudinary
      fetch("https://api.cloudinary.com/v1_1/nayananarayanan/image/upload", {//api url from cloudinary
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } 

    // if files are not prefered image formats
    else {
      toast({
        title: "Only image files allowed",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // onsubmit store url to DB
  const submitHandler = async () => {
    setLoading(true);

    // if any mandatory field is empty, show warning
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    // if password doesnot match with confirm password
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // post the user data to db
    try {
      // seting headers
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // post using axios
      const { data } = await axios.post(
        "/api/user",//post api
        { name, email, password, pic },//post data
        config//headers
      );

      // success message on successful registration
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      localStorage.setItem('userInfo',JSON.stringify(data));

      setLoading(false);
      navigate('/chats');

    } 

    // error message with error description
    catch (err) {
       toast({
         title: "Error Occured!",
         description: err.response.data,
         status: "success",
         duration: 5000,
         isClosable: true,
         position: "top",
       });
       setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your Name"
          onChange={(e) => setName(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>E-mail</FormLabel>
        <Input
          placeholder="Enter your E-mail"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button color="black" h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showconfirm ? "text" : "password"}
            placeholder="Enter your Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              color="black"
              h="1.75rem"
              size="sm"
              onClick={handleClickConfirm}
            >
              {showconfirm ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <InputGroup>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </InputGroup>
      </FormControl>

      <Button
        className="login"
        bg="rgb(24 98 120);"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup;
