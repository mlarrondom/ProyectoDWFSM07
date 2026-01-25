const User = require('../models/User');

// POST /api/user/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios: name, email, password' });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('REGISTER ERROR:', error);

        if (error && error.code === 11000) {
            return res.status(409).json({ msg: 'Ya existe un usuario con ese email' });
        }

        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                msg: 'Error de validación',
                errors: Object.values(error.errors).map((e) => e.message)
            });
        }

        res.status(400).json({
            msg: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// PUT /api/user/update
// Actualiza MI perfil (según token)
const update = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, password } = req.body;

        if (name === undefined && email === undefined && password === undefined) {
            return res.status(400).json({
                msg: 'Debes enviar al menos un campo a actualizar: name, email o password'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no existe' });
        }

        if (name !== undefined) user.name = String(name).trim();
        if (email !== undefined) user.email = String(email).trim().toLowerCase();

        // Si viene password, se hashea por el pre('save') del modelo
        if (password !== undefined) user.password = String(password);

        await user.save();

        res.json({ msg: 'Usuario actualizado OK', user });
    } catch (error) {
        console.error('UPDATE USER ERROR:', error);

        if (error && error.code === 11000) {
            return res.status(409).json({ msg: 'Ya existe un usuario con ese email' });
        }

        if (error && error.name === 'ValidationError') {
            return res.status(400).json({
                msg: 'Error de validación',
                errors: Object.values(error.errors).map((e) => e.message)
            });
        }

        res.status(400).json({
            msg: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

module.exports = {
    register,
    update
};
