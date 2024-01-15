const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { orderService } = require("../services");


const getOrders = catchAsync(async (req, res) => {
    const orders = await orderService.getOrdersByUser(req.user);
    res.send(orders);
});

const addUserOrder = catchAsync(async (req, res) => {
    const orders = await orderService.addUserOrder(
        req.user,
        req.body
    );

    res.status(httpStatus.CREATED).send(orders);
});

module.exports = { addUserOrder, getOrders }