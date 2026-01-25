require("dotenv").config();
const mongoose = require("mongoose");

const Certification = require("../models/Certification");
const certifications = require("../data/certifications.seed");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Certification.deleteMany({});
    await Certification.insertMany(certifications);

    console.log(`✅ Certificaciones cargadas: ${certifications.length}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seedCertifications:", err);
    process.exit(1);
  }
}

run();
