import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

function HomePage() {
  const navigate = useNavigate();

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('userInfo'))

    // if user logged in push to chats page
    if(user){
      navigate('/chats')
    }
  },[navigate])
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg={"rgba(24, 98, 120,0.8);"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="rgb(7, 85, 90)"
        color="white"
      >
        <Text fontSize="4xl" fontFamily="Indie Flower">
          {" "}
          Chat Wall
        </Text>
      </Box>
      <Box
        bg={"rgba(0, 0, 0, 0.5)"}
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="rgb(7, 85, 90)"
        color="white"
      >
        <Tabs variant="enclosed" colorScheme={"green"}>
          <TabList mb="1em">
            <Tab className="loginTab" width="50%">
              Log In
            </Tab>
            <Tab className="loginTab" width="50%">
              Sign Up
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default HomePage;
