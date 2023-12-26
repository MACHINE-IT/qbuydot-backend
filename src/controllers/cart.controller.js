const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

/**
 * Fetch the cart details
 *
 * Example response:
 * HTTP 200 OK
 * {
 *  "_id": "5f82eebd2b11f6979231653f",
 *  "email": "crio-user@gmail.com",
 *  "cartItems": [
 *      {
 *          "_id": "5f8feede75b0cc037b1bce9d",
 *          "product": {
 *              "_id": "5f71c1ca04c69a5874e9fd45",
 *              "name": "ball",
 *              "category": "Sports",
 *              "rating": 5,
 *              "cost": 20,
 *              "image": "google.com",
 *              "__v": 0
 *          },
 *          "quantity": 2
 *      }
 *  ],
 *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
 *  "__v": 33
 * }
 *
 *
 */
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

/**
 * Add a product to cart
 *
 *
 */
const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );

  res.status(httpStatus.CREATED).send(cart);
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated cart object
 * - If updated quantity == 0,
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 *
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 *
 *
 */
const updateProductInCart = catchAsync(async (req, res) => {
  // console.log(`req in updatecart method controller user`, req.user);
  // console.log(`req in updatecart method controller body`, req.body);
   const cart = await cartService.updateProductInCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );
  // console.log("cart in controller is ",cart)
  if (req.body.quantity === 0) {
    // If quantity is 0, send 204 NO CONTENT without cart in the response body
    res.status(httpStatus.NO_CONTENT).send(cart);
  } else {
    // If quantity is greater than 0, send 200 OK with the updated cart in the response body
    res.status(httpStatus.OK).send(cart);
  }
});
/**
 * Update product quantity in cart
 * - If updated quantity > 0, 
 */
const checkout = catchAsync(async (req, res) => {
  // console.log(`checkout called with user`, req.user)
  // console.log(`checkout called with req body`, req.body)
  await cartService.checkout(req.user);

  return res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
