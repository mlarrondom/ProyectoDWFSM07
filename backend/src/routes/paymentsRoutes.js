const express = require("express");
const {
    createPreference,
    verifyPayment
} = require("../controllers/paymentsController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Pagos / Mercado Pago (sandbox)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentBuyer:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phone
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan@correo.com"
 *         phone:
 *           type: string
 *           description: "Formato esperado en backend: +56XXXXXXXXX (se normaliza si viene como 56XXXXXXXXX o 9XXXXXXXX)."
 *           example: "+56912345678"
 *
 *     PaymentItem:
 *       type: object
 *       required:
 *         - certCode
 *         - name
 *         - price
 *       properties:
 *         certCode:
 *           type: number
 *           example: 1001
 *         name:
 *           type: string
 *           example: "Programación Web Frontend"
 *         quantity:
 *           type: number
 *           description: "Si no viene o es inválido, el backend usa 1."
 *           example: 1
 *         price:
 *           type: number
 *           example: 199000
 *
 *     CreatePreferenceRequest:
 *       type: object
 *       required:
 *         - items
 *         - buyer
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/PaymentItem'
 *         buyer:
 *           $ref: '#/components/schemas/PaymentBuyer'
 *
 *     CreatePreferenceResponse:
 *       type: object
 *       properties:
 *         initPoint:
 *           type: string
 *           example: "https://www.mercadopago.cl/checkout/v1/redirect?pref_id=..."
 *         preferenceId:
 *           type: string
 *           example: "1234567890"
 *         externalReference:
 *           type: string
 *           example: "CERTIFY-1712345678901"
 *
 *     VerifyPaymentResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "approved"
 *         transactionId:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *
 *     PaymentErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error creando preferencia de pago."
 *         detail:
 *           description: "Solo aparece en error 500 de createPreference."
 *           nullable: true
 */

/**
 * @swagger
 * /api/payments/create-preference:
 *   post:
 *     summary: Crear preferencia de pago en Mercado Pago
 *     tags: [Payments]
 *     description: >
 *       Crea una preferencia y registra una transacción en estado "pending".
 *       Si se envía Bearer token de cliente, se intenta asociar a la transacción (opcional).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePreferenceRequest'
 *     responses:
 *       200:
 *         description: Preferencia creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePreferenceResponse'
 *       400:
 *         description: Validación (carrito vacío, buyer inválido o precios inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error creando preferencia de pago
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentErrorResponse'
 */

/**
 * @swagger
 * /api/payments/verify:
 *   get:
 *     summary: Verificar/actualizar estado de pago por external_reference
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: external_reference
 *         required: true
 *         schema:
 *           type: string
 *         example: "CERTIFY-1712345678901"
 *       - in: query
 *         name: payment_id
 *         required: false
 *         schema:
 *           type: string
 *         example: "123456789"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [approved, pending, rejected]
 *         example: "approved"
 *     responses:
 *       200:
 *         description: Estado actualizado/consultado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyPaymentResponse'
 *       400:
 *         description: Falta external_reference
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error verificando pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post("/create-preference", createPreference);
router.get("/verify", verifyPayment);

module.exports = router;