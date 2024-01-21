const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { suppressDeprecationWarnings } = require("moment");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUser() function

// TODO: CRIO_TASK_MODULE_CART - Update function to process url with query params
/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else,
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */
const getUser = catchAsync(async (req, res) => {
  // Extract userId from request parameters
  const { userId } = req.params;
  const queryParam = req.query.q;

  // try {
  // Use the userService to get user data from the database
  // const user = queryParam === "address"
  //     ? await userService.getUserAddressById(userId)
  //     : await userService.getUserById(userId);
  // await userService.getUserById(userId);
  // if (queryParam && queryParam.toLowerCase() === "address") {
  //   const user = await userService.getUserAddressById(userId);
  // } else {
  //   const user = await userService.getUserById(userId);
  // }
  const user = await userService.getUserById(userId);

  const reqToken = req.headers.authorization.split(" ")[1];
  //console.log(`reqToken=${reqToken}`);
  const decode = jwt.verify(reqToken, config.jwt.secret);
  // console.log(decode);

  if (decode.sub !== userId)
    throw new ApiError(httpStatus.FORBIDDEN, "User not Found");

  // If user data exists, return it with a 200 status code
  if (user) {
    const authenticatedUserId = req.user._id.toString();

    // If the authenticated user is different from the requested user, throw a 403 error
    // if (authenticatedUserId !== userId) {
    //   throw new ApiError(httpStatus.FORBIDDEN, "User not found");
    // }

  }
  // If query param is "address", return only the address field
  if (queryParam === "address") {
    return res.status(httpStatus.OK).json({ address: user.address });
  }

  return res.status(httpStatus.OK).json(user);

  // If user data doesn't exist, throw a 404 error
  throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  // } catch (error) {
  //   // Handle unexpected errors and pass them to the error-handling middleware
  //   throw new ApiError(
  //     httpStatus.INTERNAL_SERVER_ERROR,
  //     "Internal Server Error"
  //   );
  // }
});

const createUser = async (req, res, next) => {
  // Check if the email is already taken
  const isEmailTaken = await userService.isEmailTaken(req.body.email);
  if (isEmailTaken) {
    throw new ApiError(httpStatus.OK, "Email is already taken");
  }

  // Create the user
  const user = await userService.createUser(req.body);

  // Respond with the created user
  return user;
  //res.status(httpStatus.CREATED).json(user);
};

const editUser = async (req, res, next) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  };

  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  };

  // Check if the name field is present in the request body
  if (!req.body.name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name field is required");
  }

  if (req.body.name.length < 3) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name should be minumum 3 letters")
  }
  if (req.body.name.length > 100) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name cannot be more than 100 letters")
  }

  // Check if the address field is present in the request body
  if (!req.body.address) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address field is required");
  }

  if (req.body.address.length < 20) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address should be atleast 20 characters long")
  }

  const updatedUser = await userService.editUser(user, req.body);

  res.status(httpStatus.OK).send(updatedUser);

}

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  // Check if the address field is present in the request body
  if (!req.body.address) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address field is required");
  }

  if (req.body.address.length < 20) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address should be atleast 20 characters long")
  }

  const address = await userService.setAddress(user, req.body.address);

  res.status(httpStatus.OK).send({
    address: address,
  });

});

module.exports = {
  getUser,
  createUser,
  editUser,
  setAddress,
};
