const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

/**
 * Perform the following steps:
 * -  Call the userService to create a new user
 * -  Generate auth tokens for the user
 * -  Send back
 * --- "201 Created" status code
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const register = catchAsync(async (req, res) => {
  //extracting userdata from req body
  const { email, password, name } = req.body;

  //caling user service to create user
  const user = await userService.createUser(req.body);
  // console.log(user)
  //Generating auth tokens for user
  const tokens = await tokenService.generateAuthTokens(user);

  //sending back the response
  res.status(httpStatus.CREATED).json({ user, tokens });
});

/**
 * Perform the following steps:
 * -  Call the authservice to verify if password and email is valid
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const login = catchAsync(async (req, res) => {
  //extracting user credentials from the req body
  const { email, password } = req.body;

  // try {
    const user = await authService.loginUserWithEmailAndPassword(
      email, password
    );

    // checking if authentication is successful
    // if (!user) {
    //   return res
    //     .status(httpStatus.UNAUTHORIZED)
    //     .json({ error: "Incorrect email or password" });
    // }

    const tokens = await tokenService.generateAuthTokens(user);

    res.status(httpStatus.OK).json({ user, tokens });
  // } catch (error) {
  //   res.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  // }
});

module.exports = {
  register,
  login,
};
