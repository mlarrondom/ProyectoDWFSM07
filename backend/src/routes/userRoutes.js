const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const { register, update } = require('../controllers/userController');
const { login, verifyToken } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Usuarios admin (registro/login/verificación/actualización)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@test.com"
 *         role:
 *           type: string
 *           example: "admin"
 *         createdAt:
 *           type: string
 *           example: "2026-02-21T12:34:56.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2026-02-21T12:34:56.000Z"
 *
 *     UserRegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@test.com"
 *         password:
 *           type: string
 *           example: "123456"
 *         role:
 *           type: string
 *           example: "admin"
 *
 *     UserRegisterResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     UserLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "juan@test.com"
 *         password:
 *           type: string
 *           example: "123456"
 *
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     VerifyTokenResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Token válido"
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Juan Pérez"
 *             email:
 *               type: string
 *               example: "juan@test.com"
 *             role:
 *               type: string
 *               example: "admin"
 *             createdAt:
 *               type: string
 *               example: "2026-02-21T12:34:56.000Z"
 *             updatedAt:
 *               type: string
 *               example: "2026-02-21T12:34:56.000Z"
 *
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Juan Pérez Actualizado"
 *         email:
 *           type: string
 *           example: "juan_nuevo@test.com"
 *         password:
 *           type: string
 *           example: "newpassword123"
 *
 *     UserUpdateResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Usuario actualizado OK"
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Mensaje de error"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *         error:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar usuario (admin)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegisterResponse'
 *       400:
 *         description: Datos inválidos o incompletos / validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un usuario con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión (admin) y retornar JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso (retorna token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLoginResponse'
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
 *         description: Error al iniciar sesión
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/user/verifytoken:
 *   get:
 *     summary: Verificar token JWT (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyTokenResponse'
 *       404:
 *         description: Usuario no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al verificar token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/verifytoken', auth, verifyToken);

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Actualizar mi perfil (admin, según token)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUpdateResponse'
 *       400:
 *         description: Datos inválidos / validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un usuario con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/update', auth, update);

module.exports = router;