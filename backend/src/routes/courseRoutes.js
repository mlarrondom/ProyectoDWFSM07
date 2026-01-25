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

router.get('/', getAllCourses);
router.get('/:courseCode', getCourseByCode);
router.post('/', createCourse);
router.put('/:courseCode', updateCourseByCode);
router.delete('/:courseCode', deleteCourseByCode);

module.exports = router;
