const Joi = require("joi");
const { objectId } = require("./custom.validation");

const addUserOrder = {
    body: Joi.array().items(Joi.object({
        productId: Joi.string().required().custom(objectId),
        quantity: Joi.number().required(),
    })).required(),
};

module.exports = {
    addUserOrder,
};