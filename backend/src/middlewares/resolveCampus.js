const resolveCampus = (req, res, next) => {
    const { role } = req.user;

    if (role === 'admin') {
        req.allowedCampus = null; // null => todos
        return next();
    }

    if (role === 'sede_santiago') {
        req.allowedCampus = 'Santiago';
        return next();
    }

    if (role === 'sede_concepcion') {
        req.allowedCampus = 'Concepción';
        return next();
    }

    return res.status(403).json({ msg: 'Rol no autorizado' });
};

module.exports = resolveCampus;
