const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/verify-email", controller.verifyEmail);
router.post("/resend-verification", authenticate, controller.resendVerification);

module.exports = router;
