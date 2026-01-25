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

// Seguridad base para todas las certificaciones
router.use(auth);
router.use(resolveCampus);

/**
 * @openapi
 * /api/certifications:
 *   get:
 *     tags:
 *       - Certifications
 *     summary: Listar certificaciones
 *     description: Obtiene todas las certificaciones según el rol y campus del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de certificaciones
 *       401:
 *         description: No autorizado (token faltante o inválido)
 */
router.get('/', getAllCertifications);

/**
 * @openapi
 * /api/certifications:
 *   post:
 *     tags:
 *       - Certifications
 *     summary: Crear certificación
 *     description: Crea una certificación. Para usuarios sede, el campus se controla por rol. Para admin, puede definirse en el body.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certCode
 *               - name
 *               - ownerUnit
 *               - campus
 *             properties:
 *               certCode:
 *                 type: integer
 *                 example: 9001
 *               name:
 *                 type: string
 *                 example: Certificación QA M06
 *               campus:
 *                 type: string
 *                 example: Santiago
 *               ownerUnit:
 *                 type: string
 *                 example: Facultad de Ingeniería
 *     responses:
 *       201:
 *         description: Certificación creada
 *       400:
 *         description: Validación fallida (campos requeridos o enums)
 *       409:
 *         description: certCode ya existe
 *       401:
 *         description: No autorizado
 */
router.post('/', createCertification);

/**
 * @openapi
 * /api/certifications/{certCode}:
 *   get:
 *     tags:
 *       - Certifications
 *     summary: Obtener certificación por certCode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: integer
 *         example: 9001
 *     responses:
 *       200:
 *         description: Certificación encontrada
 *       403:
 *         description: Prohibido (campus no permitido)
 *       404:
 *         description: Certificación no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/:certCode', authorizeCertificationCampus, getCertificationByCertCode);

/**
 * @openapi
 * /api/certifications/{certCode}:
 *   put:
 *     tags:
 *       - Certifications
 *     summary: Actualizar certificación (PUT)
 *     description: Actualiza name/ownerUnit. El campus solo puede ser modificado por admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Certificación Actualizada
 *               campus:
 *                 type: string
 *                 example: Concepción
 *               ownerUnit:
 *                 type: string
 *                 example: Facultad de Economía y Negocios
 *     responses:
 *       200:
 *         description: Certificación actualizada
 *       400:
 *         description: Validación fallida
 *       403:
 *         description: Prohibido (campus no permitido o sede intentando cambiar campus)
 *       404:
 *         description: Certificación no encontrada
 *       401:
 *         description: No autorizado
 */
router.put('/:certCode', authorizeCertificationCampus, updateCertification);

/**
 * @openapi
 * /api/certifications/{certCode}:
 *   delete:
 *     tags:
 *       - Certifications
 *     summary: Eliminar certificación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificación eliminada
 *       403:
 *         description: Prohibido (campus no permitido)
 *       404:
 *         description: Certificación no encontrada
 *       409:
 *         description: No se puede eliminar si tiene requisitos asociados
 *       401:
 *         description: No autorizado
 */
router.delete('/:certCode', authorizeCertificationCampus, deleteCertification);

// Rutas anidadas de requisitos (heredan auth + campus)
router.use('/:certCode/requirements', authorizeCertificationCampus, requirementRoutes);

module.exports = router;
