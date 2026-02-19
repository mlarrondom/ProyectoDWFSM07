const express = require("express");
const { createPreference } = require("../controllers/paymentsController");

const router = express.Router();

router.post("/create-preference", createPreference);

module.exports = router;