const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: payload.id,
            role: payload.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
};

module.exports = auth;
