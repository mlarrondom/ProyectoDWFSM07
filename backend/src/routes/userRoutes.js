const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const { register, update } = require('../controllers/userController');
const { login, verifyToken } = require('../controllers/authController');

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Registrar usuario
 *     description: Registra un nuevo usuario en el sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos o incompletos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/register', register);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y retorna un JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso (retorna token)
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @openapi
 * /api/user/verifytoken:
 *   get:
 *     tags:
 *       - Users
 *     summary: Verificar token
 *     description: Verifica si el token JWT es válido y devuelve información básica del usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
router.get('/verifytoken', auth, verifyToken);

/**
 * @openapi
 * /api/user/update:
 *   put:
 *     tags:
 *       - Users
 *     summary: Actualizar usuario
 *     description: Actualiza información del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.put('/update', auth, update);

module.exports = router;
