const Client = require('../models/Client');
const Transaction = require('../models/Transaction');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isValidChilePhone(phone) {
    return /^\+56\d{9}$/.test(String(phone || '').trim());
}

function requireClient(req, res) {
    if (!req.user || req.user.type !== 'client') {
        res.status(403).json({ msg: 'Acceso denegado (solo cliente)' });
        return false;
    }
    return true;
}

// GET /api/clients/me
const getMe = async (req, res) => {
    try {
        if (!requireClient(req, res)) return;

        const client = await Client.findById(req.user.id).select('fullName email phone createdAt updatedAt');

        if (!client) {
            return res.status(404).json({ msg: 'Cliente no existe' });
        }

        res.json({ client });
    } catch (error) {
        console.error('GET CLIENT ME ERROR:', error);
        res.status(500).json({ msg: 'Error al obtener perfil' });
    }
};

// PUT /api/clients/me
const updateMe = async (req, res) => {
    try {
        if (!requireClient(req, res)) return;

        const { fullName, email, phone, password } = req.body;

        if (
            fullName === undefined &&
            email === undefined &&
            phone === undefined &&
            password === undefined
        ) {
            return res.status(400).json({
                msg: 'Debes enviar al menos un campo a actualizar: fullName, email, phone o password'
            });
        }

        const client = await Client.findById(req.user.id);

        if (!client) {
            return res.status(404).json({ msg: 'Cliente no existe' });
        }

        if (fullName !== undefined) client.fullName = String(fullName).trim();

        if (email !== undefined) {
            const emailNorm = String(email).trim().toLowerCase();
            if (!isValidEmail(emailNorm)) {
                return res.status(400).json({ msg: 'Email inválido' });
            }
            client.email = emailNorm;
        }

        if (phone !== undefined) {
            const phoneNorm = String(phone).trim();
            if (!isValidChilePhone(phoneNorm)) {
                return res.status(400).json({ msg: 'Teléfono inválido (formato esperado: +56XXXXXXXXX)' });
            }
            client.phone = phoneNorm;
        }

        if (password !== undefined) {
            client.password = String(password);
        }

        await client.save();

        res.json({
            msg: 'Cliente actualizado OK',
            client: {
                id: client._id,
                fullName: client.fullName,
                email: client.email,
                phone: client.phone
            }
        });
    } catch (error) {
        console.error('UPDATE CLIENT ME ERROR:', error);

        if (error && error.code === 11000) {
            return res.status(409).json({ msg: 'Ya existe un cliente con ese email' });
        }

        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                msg: 'Error de validación',
                errors: Object.values(error.errors).map((e) => e.message)
            });
        }

        res.status(500).json({ msg: 'Error al actualizar perfil' });
    }
};

// GET /api/clients/me/purchases
const getMyPurchases = async (req, res) => {
    try {
        if (!requireClient(req, res)) return;

        const purchases = await Transaction.find({ client: req.user.id })
            .sort({ createdAt: -1 })
            .select('items amount status mp createdAt');

        res.json({ purchases });
    } catch (error) {
        console.error('GET CLIENT PURCHASES ERROR:', error);
        res.status(500).json({ msg: 'Error al obtener compras' });
    }
};

module.exports = {
    getMe,
    updateMe,
    getMyPurchases
};