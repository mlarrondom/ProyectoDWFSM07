// src/controllers/payments.controller.js (CommonJS - require)

const jwt = require('jsonwebtoken');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Transaction = require('../models/Transaction');

// helpers
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
}

function normalizeChilePhone(input) {
    const raw = String(input || '').trim();
    const cleaned = raw.replace(/[^\d+]/g, '');

    if (/^\+56\d{9}$/.test(cleaned)) return cleaned;
    if (/^56\d{9}$/.test(cleaned)) return `+${cleaned}`;
    if (/^9\d{8}$/.test(cleaned)) return `+56${cleaned}`;

    return null;
}

function getFrontUrl() {
    const frontUrl = process.env.FRONT_URL;

    if (!frontUrl) {
        throw new Error('Falta FRONT_URL en variables de entorno (ej: http://localhost:5173)');
    }

    return String(frontUrl).trim().replace(/\/$/, '');
}

function getMPClient() {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('Falta MP_ACCESS_TOKEN en variables de entorno (sandbox)');
    }
    return new MercadoPagoConfig({ accessToken });
}

function getOptionalClientId(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded && decoded.type === 'client' && decoded.id) {
            return decoded.id;
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function createPreference(req, res) {
    try {
        const { items, buyer } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Carrito vacío o inválido.' });
        }

        const fullName = String(buyer?.fullName || '').trim();
        const email = String(buyer?.email || '').trim().toLowerCase();
        const phoneNormalized = normalizeChilePhone(buyer?.phone);

        if (fullName.length < 5) return res.status(400).json({ message: 'Nombre completo inválido.' });
        if (!isValidEmail(email)) return res.status(400).json({ message: 'Email inválido.' });
        if (!phoneNormalized) return res.status(400).json({ message: 'Teléfono Chile inválido.' });

        const mpItems = items.map((it) => ({
            id: String(it.certCode),
            title: String(it.name),
            quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
            currency_id: 'CLP',
            unit_price: Number(it.price)
        }));

        if (mpItems.some((x) => !Number.isFinite(x.unit_price) || x.unit_price <= 0)) {
            return res.status(400).json({
                message: 'Hay ítems con precio inválido (0). Revisa el catálogo/carrito.'
            });
        }

        const amount = mpItems.reduce((acc, it) => acc + it.unit_price * it.quantity, 0);

        const frontUrl = getFrontUrl();
        const externalReference = `CERTIFY-${Date.now()}`;

        const client = getMPClient();
        const preference = new Preference(client);

        const backUrls = {
            success: `${frontUrl}/payment/success`,
            failure: `${frontUrl}/payment/failure`,
            pending: `${frontUrl}/payment/pending`
        };

        const result = await preference.create({
            body: {
                items: mpItems,
                payer: { name: fullName, email },
                back_urls: backUrls,
                external_reference: externalReference
                // auto_return: "approved",
            }
        });

        const clientId = getOptionalClientId(req);

        await Transaction.create({
            client: clientId,
            buyer: {
                fullName,
                email,
                phone: phoneNormalized
            },
            items: mpItems.map((it) => ({
                certCode: it.id,
                name: it.title,
                price: it.unit_price,
                quantity: it.quantity
            })),
            amount,
            status: 'pending',
            mp: {
                preferenceId: result?.id,
                externalReference
            }
        });

        return res.status(200).json({
            initPoint: result?.init_point,
            preferenceId: result?.id,
            externalReference
        });
    } catch (error) {
        console.error('MP createPreference error:', error);

        return res.status(500).json({
            message: 'Error creando preferencia de pago.',
            detail: String(error?.message || error)
        });
    }
}

module.exports = { createPreference };