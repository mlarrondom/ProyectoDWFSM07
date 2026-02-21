const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const {
    getMe,
    updateMe,
    getMyPurchases,
    cancelMyPurchase
} = require('../controllers/clientController');

router.patch('/me/purchases/:id/cancel', auth, cancelMyPurchase);

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/me/purchases', auth, getMyPurchases);

module.exports = router;