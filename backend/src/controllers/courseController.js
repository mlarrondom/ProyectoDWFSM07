const Course = require('../models/Course');

// GET /api/courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({})
            .sort({ courseCode: 1 })
            .select('courseCode name credits');

        res.json({ courses });
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener cursos' });
    }
};

// GET /api/courses/:courseCode
const getCourseByCode = async (req, res) => {
    try {
        const { courseCode } = req.params;

        const course = await Course.findOne({ courseCode });

        if (!course) {
            return res.status(404).json({ msg: 'Curso no existe' });
        }

        res.json({ course });
    } catch (error) {
        res.status(400).json({ msg: 'Error al buscar curso' });
    }
};

// POST /api/courses
const createCourse = async (req, res) => {
    try {
        const { courseCode, name, credits, area } = req.body;

        if (!courseCode || !name || credits === undefined) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios: courseCode, name, credits' });
        }

        const newCourse = await Course.create({
            courseCode,
            name,
            credits,
            area
        });

        res.status(201).json({ course: newCourse });
    } catch (error) {
        // Duplicado por unique (Mongo)
        if (error && error.code === 11000) {
            return res.status(409).json({ msg: 'Ya existe un curso con ese courseCode' });
        }

        res.status(400).json({ msg: 'Error al crear curso' });
    }
};

// PUT /api/courses/:courseCode
const updateCourseByCode = async (req, res) => {
    try {
        const { courseCode } = req.params;
        const { courseCode: bodyCourseCode, name, credits, area } = req.body;

        // No permitir cambiar el identificador
        if (bodyCourseCode && bodyCourseCode !== courseCode) {
            return res.status(400).json({ msg: 'No se puede modificar courseCode' });
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { courseCode },
            { name, credits, area },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ msg: 'Curso no existe' });
        }

        res.json({ course: updatedCourse });
    } catch (error) {
        res.status(400).json({ msg: 'Error al actualizar curso' });
    }
};

// DELETE /api/courses/:courseCode
const deleteCourseByCode = async (req, res) => {
    try {
        const { courseCode } = req.params;

        const deletedCourse = await Course.findOneAndDelete({ courseCode });

        if (!deletedCourse) {
            return res.status(404).json({ msg: 'Curso no existe' });
        }

        res.json({ msg: 'Curso eliminado', course: deletedCourse });
    } catch (error) {
        res.status(400).json({ msg: 'Error al eliminar curso' });
    }
};

module.exports = {
    getAllCourses,
    getCourseByCode,
    createCourse,
    updateCourseByCode,
    deleteCourseByCode
};
