const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRoles");

const requirementRoutes = require("./requirementRoutes");

const certificationController = require("../controllers/certificationController");

// Público
router.get("/", certificationController.getAllCertifications);
router.get("/:certCode", certificationController.getCertificationByCertCode);

// Requirements (público GET, admin resto)
router.use("/:certCode/requirements", requirementRoutes);

// Admin
router.post("/", auth, authorizeRoles("admin"), certificationController.createCertification);
router.put("/:certCode", auth, authorizeRoles("admin"), certificationController.updateCertification);
router.delete("/:certCode", auth, authorizeRoles("admin"), certificationController.deleteCertification);

module.exports = router;