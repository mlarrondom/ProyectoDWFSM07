const Certification = require("../models/Certification");

// =============================
// GET ALL
// =============================
exports.getAllCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find().sort({ certCode: 1 });
    return res.json({ certifications });
  } catch (err) {
    return res.status(500).json({ msg: "Error al listar certificaciones" });
  }
};

// =============================
// GET BY CODE
// =============================
exports.getCertificationByCertCode = async (req, res) => {
  try {
    const certCodeNum = Number(req.params.certCode);

    const certification = await Certification.findOne({
      certCode: certCodeNum,
    });

    if (!certification) {
      return res.status(404).json({ msg: "Certificación no encontrada" });
    }

    return res.json({ certification });
  } catch (err) {
    return res.status(500).json({ msg: "Error al obtener certificación" });
  }
};

// =============================
// CREATE
// =============================
exports.createCertification = async (req, res) => {
  try {
    const { certCode, name, campus, ownerUnit, price } = req.body;

    const certCodeNum = Number(certCode);
    const priceNum = price === "" || price === undefined ? 0 : Number(price);

    if (!Number.isFinite(certCodeNum) || certCodeNum <= 0) {
      return res.status(400).json({ msg: "certCode inválido" });
    }

    if (!name || !ownerUnit) {
      return res.status(400).json({ msg: "Completa Código, Nombre y Unidad." });
    }

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ msg: "Precio inválido (>= 0)." });
    }

    const created = await Certification.create({
      certCode: certCodeNum,
      name: String(name).trim(),
      campus,
      ownerUnit,
      price: priceNum,
      createdBy: req.user?._id,
    });

    return res.status(201).json({ certification: created });
  } catch (err) {
    return res.status(500).json({ msg: "Error al crear certificación" });
  }
};

// =============================
// UPDATE
// =============================
exports.updateCertification = async (req, res) => {
  try {
    const certCodeNum = Number(req.params.certCode);
    const { name, campus, ownerUnit, price } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (ownerUnit !== undefined) updates.ownerUnit = ownerUnit;
    if (campus !== undefined) updates.campus = campus;

    if (price !== undefined) {
      const priceNum = price === "" ? 0 : Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return res.status(400).json({ msg: "Precio inválido (>= 0)." });
      }
      updates.price = priceNum;
    }

    const updated = await Certification.findOneAndUpdate(
      { certCode: certCodeNum },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Certificación no encontrada" });
    }

    return res.json({ certification: updated });
  } catch (err) {
    return res.status(500).json({ msg: "Error al actualizar certificación" });
  }
};

// =============================
// DELETE
// =============================
exports.deleteCertification = async (req, res) => {
  try {
    const certCodeNum = Number(req.params.certCode);

    const deleted = await Certification.findOneAndDelete({
      certCode: certCodeNum,
    });

    if (!deleted) {
      return res.status(404).json({ msg: "Certificación no encontrada" });
    }

    return res.json({ msg: "Certificación eliminada" });
  } catch (err) {
    return res.status(500).json({ msg: "Error al eliminar certificación" });
  }
};