const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const path = require('path');
const fs = require('fs');


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetching user object from Mongo using the "_id" field and return user object
 * @param {String} id the unique id if the user
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const theUser = await User.findOne({ _id: id });
  return theUser;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email the email of the user
 * @returns {Promise<User>}
 */

const getUserByEmail = async (email) => {
  const theUser = await User.findOne({ email });
  // console.log("theUserByMailId",theUser)
  return theUser;
}
// const getUserByEmail = async (email) => {
//   // try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//     }
//     return user;
//   // } catch (error) {
//   //   throw new ApiError(
//   //     // httpStatus.INTERNAL_SERVER_ERROR,
//   //     // "Internal Server Error"
//   //     httpStatus.UNAUTHORIZED,
//   //     "User not found"
//   //   );
//   // }
// };

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */

const createUser = async (userBody) => {
  // try {
  const emailTaken = await User.isEmailTaken(userBody.email);
  if (emailTaken) {
    throw new ApiError(httpStatus.OK, "Email already taken");
  }
  const hashedPassword = await bcrypt.hash(userBody.password, 10);
  const newUser = await User.create({
    name: userBody.name,
    email: userBody.email,
    password: hashedPassword,
  });
  // await newUser.save();

  return newUser;
  // } catch (error) {
  //   if (error instanceof ApiError) {
  //     throw error;
  //   }
  //   throw new ApiError(
  //     httpStatus.INTERNAL_SERVER_ERROR,
  //     "Internal Server Error"
  //   );
  // }
};

// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
  const user = await User.findOne({ _id: id }, { address: 1, email: 1 });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};


const editUser = async (user, req, uniqueFileName) => {
  // console.log(req)
  const updateFields = {
    name: req.name,
    address: req.address,
  };

  if (uniqueFileName) {
    updateFields.profileImagePath = uniqueFileName;
  }

  // if (file) {
  //   const uniqueFileName = `${Date.now()}-${file.originalname}`;
  //   const filePath = path.join(__dirname, 'uploads', uniqueFileName);

  //   // Save the file to the server
  //   fs.writeFileSync(filePath, file.buffer);

  //   // Save the file path in the updateFields
  //   updateFields.profileImagePath = filePath;
  // }

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { $set: updateFields },
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    // Handle the case where the user with the specified _id is not found
    throw new Error("User not found");
  }

  return updatedUser;
}

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};

module.exports = {
  getUserById,
  getUserByEmail,
  createUser,
  editUser,
  getUserAddressById,
  setAddress,
};

