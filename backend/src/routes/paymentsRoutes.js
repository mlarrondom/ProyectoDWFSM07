const express = require("express");
const {
    createPreference,
    verifyPayment
} = require("../controllers/paymentsController");

const router = express.Router();

router.post("/create-preference", createPreference);
router.get("/verify", verifyPayment);

module.exports = router;