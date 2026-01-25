const Certification = require('../models/Certification');
const { CAMPUSES, OWNER_UNITS } = require('../models/Certification');
const Requirement = require('../models/Requirement');

// GET /api/certifications
const getAllCertifications = async (req, res) => {
    try {
        const filter = req.allowedCampus ? { campus: req.allowedCampus } : {};

        const certifications = await Certification.find(filter)
            .sort({ certCode: 1 })
            .select('certCode name campus ownerUnit createdBy');

        res.json({ certifications });
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener certificaciones' });
    }
};

// GET /api/certifications/:certCode
const getCertificationByCertCode = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);

        const certification = await Certification.findOne({ certCode });

        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        if (req.allowedCampus && certification.campus !== req.allowedCampus) {
            return res.status(403).json({ msg: 'No autorizado para esta certificación' });
        }

        res.json({ certification });
    } catch (error) {
        res.status(400).json({ msg: 'Código de certificación inválido' });
    }
};

// POST /api/certifications
const createCertification = async (req, res) => {
    try {
        const { certCode, name, ownerUnit } = req.body;

        if (!certCode || !name || !ownerUnit) {
            return res.status(400).json({
                msg: 'Faltan campos obligatorios (certCode, name, ownerUnit)',
            });
        }

        if (!OWNER_UNITS.includes(ownerUnit)) {
            return res.status(400).json({
                msg: `ownerUnit inválido. Valores permitidos: ${OWNER_UNITS.join(' | ')}`,
            });
        }

        const exists = await Certification.findOne({ certCode });
        if (exists) {
            return res.status(409).json({ msg: 'certCode ya existe' });
        }

        // campus controlado por rol
        const campus = req.allowedCampus || req.body.campus;

        if (!campus || !CAMPUSES.includes(campus)) {
            return res.status(400).json({
                msg: `campus inválido. Valores permitidos: ${CAMPUSES.join(' | ')}`,
            });
        }

        const certification = await Certification.create({
            certCode,
            name,
            campus,
            ownerUnit,
            createdBy: req.user.id, 
        });

        return res.status(201).json({ certification });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al crear certificación' });
    }
};


// PUT /api/certifications/:certCode
const updateCertification = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);
        const { name, campus, ownerUnit } = req.body;

        if (name === undefined && campus === undefined && ownerUnit === undefined) {
            return res.status(400).json({
                msg: 'Debes enviar al menos un campo a actualizar: name, campus u ownerUnit',
            });
        }

        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        if (req.allowedCampus && certification.campus !== req.allowedCampus) {
            return res.status(403).json({ msg: 'No autorizado para esta certificación' });
        }

        // campus solo lo puede cambiar admin
        if (campus !== undefined) {
            if (req.allowedCampus) {
                return res.status(403).json({
                    msg: 'No autorizado para modificar campus',
                });
            }

            if (!CAMPUSES.includes(campus)) {
                return res.status(400).json({
                    msg: `campus inválido. Valores permitidos: ${CAMPUSES.join(' | ')}`,
                });
            }

            certification.campus = campus;
        }

        if (ownerUnit !== undefined) {
            if (!OWNER_UNITS.includes(ownerUnit)) {
                return res.status(400).json({
                    msg: `ownerUnit inválido. Valores permitidos: ${OWNER_UNITS.join(' | ')}`,
                });
            }

            certification.ownerUnit = ownerUnit;
        }

        if (name !== undefined) {
            certification.name = String(name).trim();
        }

        await certification.save();

        return res.json({ msg: 'Certificación actualizada OK', certification });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar certificación' });
    }
};

// DELETE /api/certifications/:certCode
const deleteCertification = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);

        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        if (req.allowedCampus && certification.campus !== req.allowedCampus) {
            return res.status(403).json({ msg: 'No autorizado para esta certificación' });
        }

        const requirementsCount = await Requirement.countDocuments({
            certificationId: certification._id, // OJO: si renombraste el campo en Requirement, esto también cambia
        });

        if (requirementsCount > 0) {
            return res.status(409).json({
                msg: 'No se puede eliminar la certificación porque tiene requisitos asociados',
            });
        }

        await Certification.deleteOne({ _id: certification._id });

        return res.json({
            msg: 'Certificación eliminada correctamente',
            certCode,
        });
    } catch (error) {
        console.error('deleteCertification ERROR:', error);
        return res.status(500).json({ msg: 'Error al eliminar certificación' });
    }
};

module.exports = {
    getAllCertifications,
    getCertificationByCertCode,
    createCertification,
    updateCertification,
    deleteCertification,
};
