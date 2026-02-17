const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/authorizeRoles');

const requirementRoutes = require('./requirementRoutes');

const {
  getAllCertifications,
  getCertificationByCertCode,
  createCertification,
  updateCertification,
  deleteCertification,
} = require('../controllers/certificationController');

// ✅ Público
router.get('/', getAllCertifications);
router.get('/:certCode', getCertificationByCertCode);

// ✅ Requirements (público GET, admin resto) -> lo decide requirementRoutes
router.use('/:certCode/requirements', requirementRoutes);

// ✅ Admin
router.post('/', auth, authorizeRoles('admin'), createCertification);
router.put('/:certCode', auth, authorizeRoles('admin'), updateCertification);
router.delete('/:certCode', auth, authorizeRoles('admin'), deleteCertification);

module.exports = router;
