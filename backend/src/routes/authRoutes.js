const express = require('express');
const router = express.Router();

const {
    signup,
    login
} = require('../controllers/clientAuthController');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación de clientes (signup/login)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClientPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         fullName:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@correo.com"
 *         phone:
 *           type: string
 *           example: "+56912345678"
 *
 *     ClientSignupRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phone
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@correo.com"
 *         phone:
 *           type: string
 *           example: "+56912345678"
 *         password:
 *           type: string
 *           example: "MiPassword123"
 *
 *     ClientLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "juan@correo.com"
 *         password:
 *           type: string
 *           example: "MiPassword123"
 *
 *     ClientAuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         client:
 *           $ref: '#/components/schemas/ClientPublic'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Mensaje de error"
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Registro de nuevo cliente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientSignupRequest'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientAuthResponse'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de cliente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientLoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientAuthResponse'
 *       400:
 *         description: Email y password obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;