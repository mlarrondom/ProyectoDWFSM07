const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/authorizeRoles');

const {
    createRequirement,
    getRequirementsByCertification,
    replaceRequirementCourse,
    updateCreditsRequirement,
    deleteRequirement,
} = require('../controllers/requirementController');

// Público
/**
 * @swagger
 * tags:
 *   - name: Requirements
 *     description: "Requerimientos de una certificación (GET público, escritura solo admin)"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RequirementCourse:
 *       type: object
 *       properties:
 *         courseCode:
 *           type: string
 *           example: "MAT101"
 *         name:
 *           type: string
 *           example: "Cálculo I"
 *         credits:
 *           type: number
 *           example: 6
 *
 *     RequirementItem:
 *       type: object
 *       properties:
 *         requirementId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         group:
 *           type: number
 *           example: 1
 *         condition:
 *           type: string
 *           example: "Y"
 *         type:
 *           type: string
 *           example: "CREDITS"
 *         creditsRequired:
 *           type: number
 *           nullable: true
 *           example: 24
 *         course:
 *           nullable: true
 *           oneOf:
 *             - $ref: '#/components/schemas/RequirementCourse'
 *             - type: "null"
 *
 *     RequirementsListResponse:
 *       type: object
 *       properties:
 *         requirements:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RequirementItem'
 *
 *     RequirementCreateRequest:
 *       type: object
 *       required:
 *         - group
 *         - condition
 *         - type
 *       properties:
 *         group:
 *           type: number
 *           example: 1
 *         condition:
 *           type: string
 *           description: "Usado por reglas de negocio (ej: 'Y')."
 *           example: "Y"
 *         type:
 *           type: string
 *           description: "CREDITS o COURSE"
 *           example: "CREDITS"
 *         courseCode:
 *           type: string
 *           nullable: true
 *           example: "MAT101"
 *         creditsRequired:
 *           type: number
 *           nullable: true
 *           example: 24
 *
 *     RequirementCreateResponse:
 *       type: object
 *       properties:
 *         requirementId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         requirement:
 *           type: object
 *           description: "Documento Requirement tal como se guarda en BD."
 *
 *     RequirementReplaceCourseRequest:
 *       type: object
 *       required:
 *         - courseCode
 *       properties:
 *         courseCode:
 *           type: string
 *           example: "MAT101"
 *
 *     RequirementReplaceCourseResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Curso reemplazado OK"
 *         requirementId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *
 *     RequirementUpdateCreditsRequest:
 *       type: object
 *       required:
 *         - creditsRequired
 *       properties:
 *         creditsRequired:
 *           type: number
 *           example: 24
 *
 *     RequirementUpdateCreditsResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Créditos actualizados OK"
 *         requirementId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         creditsRequired:
 *           type: number
 *           example: 30
 *
 *     RequirementDeleteResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Requisito eliminado correctamente"
 *         requirementId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 */

/**
 * @swagger
 * /api/certifications/{certCode}/requirements:
 *   get:
 *     summary: "Listar requerimientos de una certificación (público)"
 *     tags: [Requirements]
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *     responses:
 *       200:
 *         description: "Lista de requerimientos (formato mapeado de negocio)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequirementsListResponse'
 *       404:
 *         description: "Certificación no encontrada"
 *       500:
 *         description: "Error al obtener requisitos"
 *
 *   post:
 *     summary: "Crear requerimiento para una certificación (solo admin)"
 *     tags: [Requirements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequirementCreateRequest'
 *     responses:
 *       201:
 *         description: "Requerimiento creado"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequirementCreateResponse'
 *       400:
 *         description: "Error de validación o regla de negocio"
 *       404:
 *         description: "Certificación no encontrada"
 *       409:
 *         description: "Conflicto (ej: crédito duplicado o curso duplicado por índice unique)"
 *       500:
 *         description: "Error al crear requisito"
 */

/**
 * @swagger
 * /api/certifications/{certCode}/requirements/{requirementId}:
 *   patch:
 *     summary: "Reemplazar el curso de un requisito tipo COURSE (solo admin)"
 *     tags: [Requirements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *       - in: path
 *         name: requirementId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a8b0c1a2d3e4f56789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequirementReplaceCourseRequest'
 *     responses:
 *       200:
 *         description: "Curso reemplazado"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequirementReplaceCourseResponse'
 *       400:
 *         description: "Error de validación / regla de negocio (pertenencia, tipo, courseCode faltante, etc.)"
 *       404:
 *         description: "Certificación o requisito no encontrado"
 *       409:
 *         description: "Conflicto (curso ya agregado en la certificación)"
 *       500:
 *         description: "Error al reemplazar curso del requisito"
 *
 *   delete:
 *     summary: "Eliminar un requerimiento por requirementId (solo admin)"
 *     tags: [Requirements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *       - in: path
 *         name: requirementId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a8b0c1a2d3e4f56789"
 *     responses:
 *       200:
 *         description: "Requisito eliminado"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequirementDeleteResponse'
 *       400:
 *         description: "El requisito no pertenece a esta certificación"
 *       404:
 *         description: "Certificación o requisito no encontrado"
 *       500:
 *         description: "Error al eliminar requisito"
 */

/**
 * @swagger
 * /api/certifications/{certCode}/requirements/{requirementId}/credits:
 *   patch:
 *     summary: "Actualizar creditsRequired de un requisito tipo CREDITS (solo admin)"
 *     tags: [Requirements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *       - in: path
 *         name: requirementId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a8b0c1a2d3e4f56789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequirementUpdateCreditsRequest'
 *     responses:
 *       200:
 *         description: "Créditos actualizados"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequirementUpdateCreditsResponse'
 *       400:
 *         description: "Error de validación / regla de negocio (tipo, pertenencia, creditsRequired inválido)"
 *       404:
 *         description: "Certificación o requisito no encontrado"
 *       500:
 *         description: "Error al actualizar créditos"
 */

router.get('/', getRequirementsByCertification);

// Admin
router.post('/', auth, authorizeRoles('admin'), createRequirement);
router.patch('/:requirementId', auth, authorizeRoles('admin'), replaceRequirementCourse);
router.patch('/:requirementId/credits', auth, authorizeRoles('admin'), updateCreditsRequirement);
router.delete('/:requirementId', auth, authorizeRoles('admin'), deleteRequirement);

module.exports = router;