const mongoose = require('mongoose');
const { productSchema } = require("./product.model");
const config = require("../config/config");

const orderSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        orderItems: [
            {
                product: {
                    type: productSchema,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        paymentOption: {
            type: String,
            default: `PAYMENT OPTION_DEFAULT`,
        },
    },
    {
        timestamps: true,
    }

);

orderSchema.methods.calculateTotalAmount = function () {
    let totalAmount = 0;
    this.orderItems.forEach((item) => {
        // Assuming each product has a 'cost' field
        totalAmount += item.product.cost * item.quantity;
    });
    return totalAmount;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;