const mongoose = require("mongoose");
const { productSchema } = require("./product.model");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const cartSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    cartItems: [
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
    timestamps: false,
  }
);

// Add the calculateTotalAmount method to the cartSchema
cartSchema.methods.calculateTotalAmount = function () {
  let totalAmount = 0;
  this.cartItems.forEach((item) => {
    // Assuming each product has a 'cost' field
    totalAmount += item.product.cost * item.quantity;
  });
  return totalAmount;
};


/**
 * @typedef Cart
 */
const Cart = mongoose.model("Cart", cartSchema);

module.exports.Cart = Cart;
