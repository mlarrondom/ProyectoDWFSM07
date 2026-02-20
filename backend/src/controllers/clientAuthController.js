const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isValidChilePhone(phone) {
    return /^\+56\d{9}$/.test(String(phone || '').trim());
}

// POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({
                msg: 'Faltan campos obligatorios: fullName, email, phone, password',
            });
        }

        const emailNorm = String(email).trim().toLowerCase();
        const phoneNorm = String(phone).trim();

        if (!isValidEmail(emailNorm)) {
            return res.status(400).json({ msg: 'Email inválido' });
        }

        if (!isValidChilePhone(phoneNorm)) {
            return res.status(400).json({
                msg: 'Teléfono inválido (formato esperado: +56XXXXXXXXX)',
            });
        }

        const exists = await Client.findOne({ email: emailNorm });
        if (exists) {
            return res
                .status(409)
                .json({ msg: 'Ya existe un cliente con ese email' });
        }

        const client = await Client.create({
            fullName: String(fullName).trim(),
            email: emailNorm,
            phone: phoneNorm,
            password: String(password),
        });

        const token = jwt.sign(
            {
                id: client._id,
                type: 'client',
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
            },
        );

        res.status(201).json({
            token,
            client: {
                id: client._id,
                fullName: client.fullName,
                email: client.email,
                phone: client.phone,
            },
        });
    } catch (error) {
        console.error('CLIENT SIGNUP ERROR:', error);

        if (error && error.code === 11000) {
            return res
                .status(409)
                .json({ msg: 'Ya existe un cliente con ese email' });
        }

        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                msg: 'Error de validación',
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }

        // res.status(500).json({ msg: 'Error al registrar cliente' });
        return res.status(500).json({
            msg: 'CLIENT_SIGNUP_DEBUG_123',
            error: error?.message,
            name: error?.name,
        });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ msg: 'Email y password son obligatorios' });
        }

        const emailNorm = String(email).trim().toLowerCase();

        const client = await Client.findOne({ email: emailNorm });
        if (!client) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await client.comparePassword(String(password));
        if (!isMatch) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            {
                id: client._id,
                type: 'client',
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
            },
        );

        res.json({
            token,
            client: {
                id: client._id,
                fullName: client.fullName,
                email: client.email,
                phone: client.phone,
            },
        });
    } catch (error) {
        console.error('CLIENT LOGIN ERROR:', error);
        res.status(500).json({ msg: 'Error al iniciar sesión' });
    }
};

module.exports = {
    signup,
    login,
};
