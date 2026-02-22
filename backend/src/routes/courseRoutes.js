const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/authorizeRoles');

const {
    getAllCourses,
    getCourseByCode,
    createCourse,
    updateCourseByCode,
    deleteCourseByCode,
} = require('../controllers/courseController');

router.use(auth);
router.use(authorizeRoles('admin'));

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Mantenedor de cursos (solo admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a8b0c1a2d3e4f56789"
 *         courseCode:
 *           type: string
 *           example: "MAT101"
 *         name:
 *           type: string
 *           example: "Cálculo I"
 *         credits:
 *           type: number
 *           example: 6
 *         area:
 *           type: string
 *           example: "Matemática"
 *
 *     CoursesListResponse:
 *       type: object
 *       properties:
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *
 *     CourseResponse:
 *       type: object
 *       properties:
 *         course:
 *           $ref: '#/components/schemas/Course'
 *
 *     CourseCreateRequest:
 *       type: object
 *       required:
 *         - courseCode
 *         - name
 *         - credits
 *       properties:
 *         courseCode:
 *           type: string
 *           example: "MAT101"
 *         name:
 *           type: string
 *           example: "Cálculo I"
 *         credits:
 *           type: number
 *           example: 6
 *         area:
 *           type: string
 *           example: "Matemática"
 *
 *     CourseUpdateRequest:
 *       type: object
 *       properties:
 *         courseCode:
 *           type: string
 *           description: "No se permite cambiar courseCode (si se envía distinto al parámetro, retorna 400)."
 *           example: "MAT101"
 *         name:
 *           type: string
 *           example: "Cálculo I"
 *         credits:
 *           type: number
 *           example: 6
 *         area:
 *           type: string
 *           example: "Matemática"
 *
 *     CourseDeleteResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: "Curso eliminado"
 *         course:
 *           $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Listar cursos (solo admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesListResponse'
 *       500:
 *         description: Error al obtener cursos
 *
 *   post:
 *     summary: Crear curso (solo admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreateRequest'
 *     responses:
 *       201:
 *         description: Curso creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: Error al crear curso o faltan campos obligatorios
 *       409:
 *         description: Ya existe un curso con ese courseCode
 */

/**
 * @swagger
 * /api/courses/{courseCode}:
 *   get:
 *     summary: Obtener curso por courseCode (solo admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "MAT101"
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: Curso no existe
 *       400:
 *         description: Error al buscar curso
 *
 *   put:
 *     summary: Actualizar curso por courseCode (solo admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "MAT101"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateRequest'
 *     responses:
 *       200:
 *         description: Curso actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       404:
 *         description: Curso no existe
 *       400:
 *         description: Error al actualizar curso (incluye no permitir modificar courseCode)
 *
 *   delete:
 *     summary: Eliminar curso por courseCode (solo admin)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "MAT101"
 *     responses:
 *       200:
 *         description: Curso eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseDeleteResponse'
 *       404:
 *         description: Curso no existe
 *       400:
 *         description: Error al eliminar curso
 */

router.get('/', getAllCourses);
router.get('/:courseCode', getCourseByCode);
router.post('/', createCourse);
router.put('/:courseCode', updateCourseByCode);
router.delete('/:courseCode', deleteCourseByCode);

module.exports = router;