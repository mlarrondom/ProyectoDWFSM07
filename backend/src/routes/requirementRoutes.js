const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/authorizeRoles');

const {
    createRequirement,
    getRequirementsByCertification,
    replaceRequirementCourse,
    updateCreditsRequirement,
    deleteRequirement,
} = require('../controllers/requirementController');

// Público
router.get('/', getRequirementsByCertification);

// Admin
router.post('/', auth, authorizeRoles('admin'), createRequirement);
router.patch('/:requirementId', auth, authorizeRoles('admin'), replaceRequirementCourse);
router.patch('/:requirementId/credits', auth, authorizeRoles('admin'), updateCreditsRequirement);
router.delete('/:requirementId', auth, authorizeRoles('admin'), deleteRequirement);

module.exports = router;
