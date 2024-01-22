const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const authMiddleware = require("../../middlewares/auth"); // Import the auth middleware
const auth = require("../../middlewares/auth");
const multer = require('multer');
const path = require('path');

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`

// // Configuring multer for file upload
// const upload = multer({
//   limits: {
//     fileSize: 10485761, // Limit file size to 10 MB (adjust as needed)
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error('Please upload a valid image file'));
//     }
//     if (file.size > 10485761) {
//       return cb(new Error('File size should be less than 10MB'));
//     }

//     cb(undefined, true);
//   },
// });
let uniqueFileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    console.log(file.originalname)
    uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

router.get(
  "/:userId",
  authMiddleware,
  validate(userValidation.getUser),
  userController.getUser
);

router.patch(
  "/:userId",
  authMiddleware,
  validate(userValidation.getUser),
  upload.single('profileImage'), // Using multer middleware for handeling file upload for validation and security checks to ensure that only valid image files are accepted.
  (req, res, next) => userController.editUser(req, res, next, `uploads/${uniqueFileName}`)
);

router.post(
  "/",
  validate(userValidation.createUser),
  userController.createUser
);

router.put(
  "/:userId",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;
