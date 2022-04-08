import { ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

function ProfileModal({ user, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* if children are supplied, display children, else display eye icon */}
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          color="black"
          d={{ base: "flex" }}
          // ml={{ base: '50vw', md:'43vw', lg:'48vw', xl:'52vw'}}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}

      {/* profile modal */}
      <Modal
        size="lg"
        isCentered
        onClose={onClose}
        isOpen={isOpen}
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent color=" rgb(3, 63, 63)" h="410px">
          {/* modal header as user name */}
          <ModalHeader
            fontSize="40px"
            fontFamily="Indie Flower"
            d="flex"
            justifyContent="center"
          >
            <u>{user.name}</u>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* user pic */}
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
            />
            {/* user email id */}
            <Text
              border="1px black solid"
              p={1}
              borderRadius="10px"
              fontSize={{ base: "15px", md: "20px" }}
            >
              <b>Email: </b> {user.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blackAlpha" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ProfileModal;
