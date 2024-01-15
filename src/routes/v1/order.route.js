const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const orderValidation = require("../../validations/order.validation");
const { orderController } = require("../../controllers/");

const router = express.Router();

router.get("/", auth, orderController.getOrders);

router.post(
    "/",
    auth,
    validate(orderValidation.addUserOrder),
    orderController.addUserOrder
);

module.exports = router;