const { number } = require("joi");
const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase:true,
      validate(value)
      {
        if(!validator.isEmail(value))
        {
          throw new Error("Invalid Email")
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minength:8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default:config.default_wallet_money
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */

// userSchema.pre("save", async function(next) {
//   const user = this;
//   const emailTaken = await mongoose.models.User.findOne({email: user.email});
//   if(emailTaken) {
//     throw new Error("Email is already taken!")
//   }
//   next();
// });

userSchema.statics.isEmailTaken = async function (email) {
  const result = await this.find({email: email});
    if(result.length)
      return true;
    else
      return false;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;

  // Use bcrypt to compare the provided password with the stored hashed password
  return bcrypt.compare(password, user.password);
  
};

// // Pre-save hook to hash the password before saving it to the database
// userSchema.pre("save", async function (next) {
//   const user = this;

//   // Hash the password only if it's been modified or is new
//   if (user.isModified("password")) {
//     const saltRounds = 10;
//     user.password = await bcrypt.hash(user.password, saltRounds);
//   }

//   next();
// });



/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
   return user.address !== config.default_address;
};

/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */

const User = mongoose.model("User", userSchema);

module.exports = {User};
