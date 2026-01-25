const Certification = require('../models/Certification');

const authorizeCertificationCampus = async (req, res, next) => {
    try {
        if (req.allowedCampus === null) {
            return next();
        }

        const certCode = Number(req.params.certCode);
        if (Number.isNaN(certCode)) {
            return res.status(400).json({ msg: 'certCode inválido' });
        }

        const certification = await Certification.findOne({ certCode }).select('campus');
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        if (certification.campus !== req.allowedCampus) {
            return res.status(403).json({ msg: 'No autorizado para esta certificación' });
        }

        next();
    } catch (error) {
        return res.status(400).json({ msg: 'Error al autorizar certificación' });
    }
};

module.exports = authorizeCertificationCampus;
