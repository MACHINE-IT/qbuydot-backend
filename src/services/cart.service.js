const httpStatus = require("http-status");
const { Order, Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart.");
  }

  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    cart = await Cart.create({
      email: user.email,
      cartItems: [],
      paymentOption: "PAYMENT_OPTION_DEFAULT",
    });
  }
  if (!cart) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Cart is Empty");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist."
    );
  }

  if (cart.cartItems.some((item) => item.product._id.equals(productId))) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product's already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }

  cart.cartItems.push({
    product: product,
    quantity: quantity,
  });

  // Save the updated cart
  await cart.save();

  return cart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. To create cart, please add a product"
    );
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist."
    );
  }

  const cartItem = cart.cartItems.find((item) =>
    item.product._id.equals(productId)
  );

  if (!cartItem) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  if (quantity > 0) {
    cartItem.quantity = quantity;
  } else {
    // If quantity is 0, remove the product from cart
    cart.cartItems = cart.cartItems.filter(
      (item) => !item.product._id.equals(productId)
    );
  }

  // Save the updated cart
  await cart.save();
  // console.log("cart in cart service is",cart);
  return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  const cartItem = cart.cartItems.find((item) =>
    item.product._id.equals(productId)
  );

  if (!cartItem) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  // Remove the product from cart
  cart.cartItems = cart.cartItems.filter(
    (item) => !item.product._id.equals(productId)
  );

  // Save the updated cart
  await cart.save();
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const cart = await Cart.findOne({ email: user.email })

  if (cart == null) {
    throw new ApiError(httpStatus.NOT_FOUND, "You do not have a cart to checkout.");
  }
  if (cart.cartItems.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You do not have any items in the cart to checkout.");

  }

  const hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress)
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");

  const total = cart.cartItems.reduce((acc, item) => {
    acc = acc + (item.product.cost * item.quantity);
    return acc;
  }, 0)


  if (total > user.walletMoney) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You do not have sufficient balance to chekout.")
  }
  user.walletMoney -= total;
  await user.save();


  await Order.create({
    email: user.email,
    orderItems: cart.cartItems,
    paymentOption: "PAYMENT_OPTION_DEFAULT",
  });

  cart.cartItems = [];
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
