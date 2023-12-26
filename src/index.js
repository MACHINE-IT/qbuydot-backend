const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
require("dotenv").config();

let PORT = process.env.PORT || 3000;

let server;

mongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGODB_URL);

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

// Create Mongo connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Reroute all API requests beginning with the `/v1/users` route to Express router in user.route.js
    

    // Get the express app to listen on the configured port
    app.listen(PORT, () => {
      console.log(`Your server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
