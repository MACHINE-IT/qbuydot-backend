const httpStatus = require("http-status");
const { Product, Order } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


const getOrdersByUser = async (user) => {
    const orders = await Order.find({ email: user.email });

    if (!orders) {
        throw new ApiError(httpStatus.NOT_FOUND, "User does not have any orders placed!");
    }

    return orders;
};

const addUserOrder = async (user, orderPayload) => {

    let orderItems = [];

    for (let i = 0; i < orderPayload.length; i++) {
        const product = await Product.findById(orderPayload[i].productId);

        if (!product) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Product doesn't exist in database"
            );
        }
        orderItems.push({
            product: product,
            quantity: orderPayload[i].quantity,
        });
    }

    return await Order.create({
        email: user.email,
        orderItems: orderItems,
        paymentOption: "PAYMENT_OPTION_DEFAULT",
    });


};

module.exports = { getOrdersByUser, addUserOrder }

