const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");

/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  // Fetching user object corresponding to the provided email
  const user = await userService.getUserByEmail(email);
  if(!user)
  {
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorrect Credentials")
  }

  // Checking if the provided password matches the one stored in the database
  // const isPasswordMatch = await user.isPasswordMatch(password);
  // console.log(isPasswordMatch)
  //Checking if user exists
  // if(!user) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  // }
  // if(!isPasswordMatch) {
  //   throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  // }
 
  if(!(await user.isPasswordMatch(password)))
  {
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorrect Credentials")
  }

  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
};
