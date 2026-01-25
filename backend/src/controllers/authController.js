const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/user/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email y password son obligatorios' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: 'Error al iniciar sesión' });
    }
};

// GET /api/user/verifytoken
const verifyToken = async (req, res) => {
    try {
        // Si llegaste acá, el middleware auth ya validó el token
        const user = await User.findById(req.user.id).select('name email role createdAt updatedAt');

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no existe' });
        }

        res.json({
            msg: 'Token válido',
            user
        });
    } catch (error) {
        res.status(500).json({ msg: 'Error al verificar token' });
    }
};

module.exports = {
    login,
    verifyToken
};
