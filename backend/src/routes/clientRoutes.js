const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const {
    getMe,
    updateMe,
    getMyPurchases,
    cancelMyPurchase
} = require('../controllers/clientController');

/**
 * @swagger
 * tags:
 *   - name: Clients
 *     description: Perfil y compras del cliente (requiere JWT tipo client)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClientMe:
 *       type: object
 *       properties:
 *         _id:
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
 *         createdAt:
 *           type: string
 *           example: "2026-02-21T12:34:56.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2026-02-21T12:34:56.000Z"
 *
 *     ClientMeResponse:
 *       type: object
 *       properties:
 *         client:
 *           $ref: '#/components/schemas/ClientMe'
 *
 *     ClientUpdateMeRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Juan Pérez Actualizado"
 *         email:
 *           type: string
 *           example: "juan_nuevo@correo.com"
 *         phone:
 *           type: string
 *           description: "Formato esperado: +56XXXXXXXXX"
 *           example: "+56912345678"
 *         password:
 *           type: string
 *           example: "newpassword123"
 *
 *     ClientUpdateMeResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Cliente actualizado OK"
 *         client:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "65f1c2a8b0c1a2d3e4f56789"
 *             fullName:
 *               type: string
 *               example: "Juan Pérez"
 *             email:
 *               type: string
 *               example: "juan@correo.com"
 *             phone:
 *               type: string
 *               example: "+56912345678"
 *
 *     TransactionMp:
 *       type: object
 *       properties:
 *         preferenceId:
 *           type: string
 *           nullable: true
 *           example: "1234567890"
 *         externalReference:
 *           type: string
 *           nullable: true
 *           example: "CERTIFY-1712345678901"
 *         paymentId:
 *           type: string
 *           nullable: true
 *           example: "123456789"
 *
 *     TransactionItem:
 *       type: object
 *       properties:
 *         certCode:
 *           type: string
 *           example: "1001"
 *         name:
 *           type: string
 *           example: "Programación Web Frontend"
 *         price:
 *           type: number
 *           example: 199000
 *         quantity:
 *           type: number
 *           example: 1
 *
 *     Purchase:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionItem'
 *         amount:
 *           type: number
 *           example: 199000
 *         status:
 *           type: string
 *           example: "pending"
 *         mp:
 *           $ref: '#/components/schemas/TransactionMp'
 *         createdAt:
 *           type: string
 *           example: "2026-02-21T12:34:56.000Z"
 *
 *     PurchasesResponse:
 *       type: object
 *       properties:
 *         purchases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Purchase'
 *
 *     CancelPurchaseResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Compra cancelada correctamente."
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
 */

/**
 * @swagger
 * /api/clients/me:
 *   get:
 *     summary: Obtener mi perfil de cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientMeResponse'
 *       403:
 *         description: Acceso denegado (solo cliente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cliente no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al obtener perfil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Actualizar mi perfil de cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientUpdateMeRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClientUpdateMeResponse'
 *       400:
 *         description: Validación (campos, email/teléfono inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Acceso denegado (solo cliente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cliente no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un cliente con ese email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al actualizar perfil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/clients/me/purchases:
 *   get:
 *     summary: Listar mis compras (transacciones) como cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de compras del cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchasesResponse'
 *       403:
 *         description: Acceso denegado (solo cliente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al obtener compras
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/clients/me/purchases/{id}/cancel:
 *   patch:
 *     summary: Cancelar una compra pendiente del cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1c2a8b0c1a2d3e4f56789"
 *     responses:
 *       200:
 *         description: Compra cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CancelPurchaseResponse'
 *       400:
 *         description: Solo se pueden cancelar compras pendientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error cancelando compra
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.patch('/me/purchases/:id/cancel', auth, cancelMyPurchase);

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/me/purchases', auth, getMyPurchases);

module.exports = router;