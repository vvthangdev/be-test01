const User = require("../models/user.model.js");
// const bcrypt = require("bcrypt");
require("dotenv").config();
const userService = require("../services/user.service");
const authUtil = require("../utils/auth.util");
const { Auth, LoginCredentials } = require("two-step-auth");

const adminDeleteUser = async (req, res) => {
  try {
    let { username } = req.body;
    if (!username) {
      return res.status(401).send("Username required!");
    }
    // Verify the access token to ensure the user is authenticated
    const user = await userService.getUserByUserName(username);
    console.log(username);

    await userService.deleteUser(username);

    res.json({
      status: "SUCCESS",
      message: "User deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred while deleting the user!");
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const { username, ...otherFields } = req.body; // Adjust as needed to accept relevant fields

    // console.log(req.username)
    // console.log(otherFields);
    if(!username) {
        return res.status(400).send("Username required!")
    }
    if (!otherFields || Object.keys(otherFields).length === 0) {
      return res.status(400).send("No fields to update.");
    }

    // Update the user information in the database
    const updatedUser = await userService.updateUser(username, {
      ...otherFields, // Spread other fields if there are additional updates
    });

    if (!updatedUser) {
      return res.status(404).send("User not found!");
    }
    res.json({
      status: "SUCCESS",
      message: "User updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred while updating the user!");
  }
};

module.exports = {
  adminDeleteUser,
  adminUpdateUser,
};
