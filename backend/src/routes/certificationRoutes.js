const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const resolveCampus = require('../middlewares/resolveCampus');
const authorizeCertificationCampus = require('../middlewares/authorizeCertificationCampus');

const requirementRoutes = require('./requirementRoutes');

const {
  getAllCertifications,
  getCertificationByCertCode,
  createCertification,
  updateCertification,
  deleteCertification,
} = require('../controllers/certificationController');

/**
 * ============================
 * RUTA PÚBLICA (CATÁLOGO)
 * ============================
 */

/**
 * @openapi
 * /api/certifications:
 *   get:
 *     tags:
 *       - Certifications
 *     summary: Listar certificaciones (público)
 *     description: Obtiene todas las certificaciones disponibles (sin autenticación).
 *     responses:
 *       200:
 *         description: Lista de certificaciones
 */
router.get('/', getAllCertifications);

/**
 * ============================
 * RUTAS PROTEGIDAS (ADMIN)
 * ============================
 */

// Desde aquí TODO requiere token
router.use(auth);
router.use(resolveCampus);

/**
 * Crear certificación
 */
router.post('/', createCertification);

/**
 * Obtener certificación por certCode
 */
router.get('/:certCode', authorizeCertificationCampus, getCertificationByCertCode);

/**
 * Actualizar certificación
 */
router.put('/:certCode', authorizeCertificationCampus, updateCertification);

/**
 * Eliminar certificación
 */
router.delete('/:certCode', authorizeCertificationCampus, deleteCertification);

/**
 * Rutas anidadas de requisitos
 */
router.use('/:certCode/requirements', authorizeCertificationCampus, requirementRoutes);

module.exports = router;
