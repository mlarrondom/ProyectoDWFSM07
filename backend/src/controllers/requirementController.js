const Certification = require('../models/Certification');
const Course = require('../models/Course');
const Requirement = require('../models/Requirement');

// POST /api/certifications/:certCode/requirements
const createRequirement = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);
        const { group, condition, type, courseCode, creditsRequired } = req.body;

        // 1) Validaciones base
        if (!group || !condition || !type) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios (group, condition, type)' });
        }

        // 2) Buscar certificación por certCode (negocio)
        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        // 3) Reglas por tipo
        if (type === 'CREDITS') {
            // Reglas de negocio (según tu lógica)
            if (Number(group) !== 1) {
                return res.status(400).json({ msg: 'Créditos deben ir en group 1' });
            }
            if (condition !== 'Y') {
                return res.status(400).json({ msg: 'Créditos deben tener condition "Y"' });
            }
            if (!creditsRequired || Number(creditsRequired) <= 0) {
                return res.status(400).json({ msg: 'Créditos debe ser un número mayor a 0' });
            }

            // Solo 1 requisito de créditos por certificación
            const creditsExists = await Requirement.findOne({
                certificationId: certification._id, // OJO: se mantiene certificationId por compatibilidad
                type: 'CREDITS',
                group: 1,
            });

            if (creditsExists) {
                return res.status(409).json({ msg: 'Ya existe un requisito de créditos (group 1) para esta certificación' });
            }

            const requirement = await Requirement.create({
                certificationId: certification._id,
                group: 1,
                condition: 'Y',
                type: 'CREDITS',
                creditsRequired: Number(creditsRequired),
                courseId: null,
            });

            return res.status(201).json({
                requirementId: requirement._id,
                requirement,
            });
        }

        if (type === 'COURSE') {
            if (!courseCode) {
                return res.status(400).json({ msg: 'Para curso debes enviar un código válido' });
            }

            // Validar curso contra catálogo maestro
            const course = await Course.findOne({ courseCode });
            if (!course) {
                return res.status(400).json({ msg: 'Código de curso no existe en el sistema' });
            }

            // Crear requisito COURSE
            const requirement = await Requirement.create({
                certificationId: certification._id,
                group: Number(group),
                condition,
                type: 'COURSE',
                courseId: course._id,
                creditsRequired: null,
            });

            return res.status(201).json({
                requirementId: requirement._id,
                requirement,
            });
        }

        return res.status(400).json({ msg: 'Tipo de requisito inválido (usa CREDITS (créditos) o COURSE (curso))' });
    } catch (error) {
        // Duplicado por índice (mismo courseId en misma certificationId)
        if (error.code === 11000) {
            return res.status(409).json({ msg: 'El curso ya está agregado como requisito en esta certificación' });
        }
        return res.status(500).json({ msg: 'Error al crear requisito' });
    }
};

// GET /api/certifications/:certCode/requirements
const getRequirementsByCertification = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);

        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        const requirements = await Requirement.find({ certificationId: certification._id })
            .sort({ group: 1, createdAt: 1 })
            .populate('courseId', 'courseCode name credits');

        // Formato más “de negocio”
        const mapped = requirements.map((r) => ({
            requirementId: r._id,
            group: r.group,
            condition: r.condition,
            type: r.type,
            creditsRequired: r.type === 'CREDITS' ? r.creditsRequired : null,
            course: r.type === 'COURSE' && r.courseId
                ? {
                    courseCode: r.courseId.courseCode,
                    name: r.courseId.name,
                    credits: r.courseId.credits,
                }
                : null,
        }));

        return res.json({ requirements: mapped });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al obtener requisitos' });
    }
};

// PATCH /api/certifications/:certCode/requirements/:requirementId
// Caso de uso: reemplazar curso
const replaceRequirementCourse = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);
        const { requirementId } = req.params;
        const { courseCode } = req.body;

        if (!courseCode) {
            return res.status(400).json({ msg: 'Debes enviar código de curso' });
        }

        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ msg: 'Requisito no encontrado' });
        }

        // Asegura que el requisito pertenece a la certificación indicada
        if (requirement.certificationId.toString() !== certification._id.toString()) {
            return res.status(400).json({ msg: 'El requisito no pertenece a esta certificación' });
        }

        if (requirement.type !== 'COURSE') {
            return res.status(400).json({ msg: 'Solo puedes reemplazar curso en requisitos tipo COURSE' });
        }

        const newCourse = await Course.findOne({ courseCode });
        if (!newCourse) {
            return res.status(400).json({ msg: 'Código del curso no existe en el catálogo' });
        }

        requirement.courseId = newCourse._id;
        await requirement.save();

        return res.json({
            msg: 'Curso reemplazado OK',
            requirementId: requirement._id,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ msg: 'Ese curso ya está agregado como requisito en esta certificación' });
        }
        return res.status(500).json({ msg: 'Error al reemplazar curso del requisito' });
    }
};

// Caso de uso: reemplazar créditos
const updateCreditsRequirement = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);
        const { requirementId } = req.params;
        const { creditsRequired } = req.body;

        // Validación input
        const creditsNum = Number(creditsRequired);
        if (!creditsRequired || Number.isNaN(creditsNum) || creditsNum <= 0) {
            return res.status(400).json({
                msg: 'creditsRequired debe ser un número mayor a 0',
            });
        }

        // Buscar certificación por certCode
        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        // Buscar requisito por ID técnico
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ msg: 'Requisito no encontrado' });
        }

        // Verificar pertenencia a la certificación
        if (requirement.certificationId.toString() !== certification._id.toString()) {
            return res.status(400).json({ msg: 'El requisito no pertenece a esta certificación' });
        }

        // Solo aplica a requisitos tipo CREDITS
        if (requirement.type !== 'CREDITS') {
            return res.status(400).json({
                msg: 'Solo puedes actualizar creditsRequired en requisitos tipo CREDITS',
            });
        }

        // Actualizar
        requirement.creditsRequired = creditsNum;
        await requirement.save();

        return res.json({
            msg: 'Créditos actualizados OK',
            requirementId: requirement._id,
            creditsRequired: requirement.creditsRequired,
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar créditos' });
    }
};

// DELETE /api/certifications/:certCode/requirements/:requirementId
const deleteRequirement = async (req, res) => {
    try {
        const certCode = Number(req.params.certCode);
        const { requirementId } = req.params;

        // 1) Buscar certificación
        const certification = await Certification.findOne({ certCode });
        if (!certification) {
            return res.status(404).json({ msg: 'Certificación no encontrada' });
        }

        // 2) Buscar requisito
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ msg: 'Requisito no encontrado' });
        }

        // 3) Verificar pertenencia
        if (requirement.certificationId.toString() !== certification._id.toString()) {
            return res.status(400).json({
                msg: 'El requisito no pertenece a esta certificación',
            });
        }

        // 4) Eliminar
        await Requirement.deleteOne({ _id: requirement._id });

        return res.json({
            msg: 'Requisito eliminado correctamente',
            requirementId,
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al eliminar requisito' });
    }
};

module.exports = {
    createRequirement,
    getRequirementsByCertification,
    replaceRequirementCourse,
    updateCreditsRequirement,
    deleteRequirement,
};
