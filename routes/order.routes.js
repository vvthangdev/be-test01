const express = require("express");
const userMiddleware = require("../middlewares/user.middleware.js");
const orderController = require("../controllers/order.controller.js");
const authMiddware = require("../middlewares/auth.middleware.js");
// const userUtil = require("../utils/user.util.js");
// const authMiddware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/", orderController.getAllOrders);

router.post("/create-order", orderController.createOrder);

// router.patch("/update-reservation", orderController.updateOrder);

// router.delete("/delete-reservation", orderController.deleteOrder);

module.exports = router;