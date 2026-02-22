const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRoles");

const requirementRoutes = require("./requirementRoutes");

const certificationController = require("../controllers/certificationController");

// Público
/**
 * @swagger
 * tags:
 *   - name: Certifications
 *     description: Catálogo de certificaciones (público) y CRUD (admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Certification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         certCode:
 *           type: number
 *           example: 1001
 *         name:
 *           type: string
 *           example: "Programación Web Frontend"
 *         campus:
 *           type: string
 *           example: "Santiago"
 *         ownerUnit:
 *           type: string
 *           example: "Facultad de Ingeniería"
 *         price:
 *           type: number
 *           example: 199000
 *         createdBy:
 *           type: string
 *           nullable: true
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *
 *     CertificationsListResponse:
 *       type: object
 *       properties:
 *         certifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Certification'
 *
 *     CertificationResponse:
 *       type: object
 *       properties:
 *         certification:
 *           $ref: '#/components/schemas/Certification'
 *
 *     CertificationCreateRequest:
 *       type: object
 *       required:
 *         - certCode
 *         - name
 *         - ownerUnit
 *       properties:
 *         certCode:
 *           type: number
 *           example: 1001
 *         name:
 *           type: string
 *           example: "Programación Web Frontend"
 *         campus:
 *           type: string
 *           example: "Santiago"
 *         ownerUnit:
 *           type: string
 *           example: "Facultad de Ingeniería"
 *         price:
 *           type: number
 *           description: "Si se envía vacío o undefined, se guarda como 0."
 *           example: 199000
 *
 *     CertificationUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Programación Web Frontend"
 *         campus:
 *           type: string
 *           example: "Santiago"
 *         ownerUnit:
 *           type: string
 *           example: "Facultad de Ingeniería"
 *         price:
 *           type: number
 *           description: "Si se envía como string vacío '', se guarda como 0. Debe ser >= 0."
 *           example: 250000
 *
 *     DeleteMessageResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Certificación eliminada"
 */

/**
 * @swagger
 * /api/certifications:
 *   get:
 *     summary: Listar certificaciones (público)
 *     tags: [Certifications]
 *     responses:
 *       200:
 *         description: Lista de certificaciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificationsListResponse'
 *       500:
 *         description: Error al listar certificaciones
 *
 *   post:
 *     summary: Crear certificación (solo admin)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificationCreateRequest'
 *     responses:
 *       201:
 *         description: Certificación creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificationResponse'
 *       400:
 *         description: Error de validación (certCode inválido, precio inválido o faltan campos)
 *       500:
 *         description: Error al crear certificación
 */

/**
 * @swagger
 * /api/certifications/{certCode}:
 *   get:
 *     summary: Obtener certificación por certCode (público)
 *     tags: [Certifications]
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *     responses:
 *       200:
 *         description: Certificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificationResponse'
 *       404:
 *         description: Certificación no encontrada
 *       500:
 *         description: Error al obtener certificación
 *
 *   put:
 *     summary: Actualizar certificación por certCode (solo admin)
 *     tags: [Certifications]
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
 *             $ref: '#/components/schemas/CertificationUpdateRequest'
 *     responses:
 *       200:
 *         description: Certificación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificationResponse'
 *       400:
 *         description: Error de validación (precio inválido)
 *       404:
 *         description: Certificación no encontrada
 *       500:
 *         description: Error al actualizar certificación
 *
 *   delete:
 *     summary: Eliminar certificación por certCode (solo admin)
 *     tags: [Certifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certCode
 *         required: true
 *         schema:
 *           type: number
 *         example: 1001
 *     responses:
 *       200:
 *         description: Certificación eliminada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteMessageResponse'
 *       404:
 *         description: Certificación no encontrada
 *       500:
 *         description: Error al eliminar certificación
 */

router.get("/", certificationController.getAllCertifications);
router.get("/:certCode", certificationController.getCertificationByCertCode);

// Requirements (público GET, admin resto)
router.use("/:certCode/requirements", requirementRoutes);

// Admin
router.post("/", auth, authorizeRoles("admin"), certificationController.createCertification);
router.put("/:certCode", auth, authorizeRoles("admin"), certificationController.updateCertification);
router.delete("/:certCode", auth, authorizeRoles("admin"), certificationController.deleteCertification);

module.exports = router;