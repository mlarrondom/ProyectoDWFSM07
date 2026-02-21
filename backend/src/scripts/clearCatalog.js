/* src/scripts/clearCatalog.js */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');

const Course = require('../models/Course');
const Certification = require('../models/Certification');
const Requirement = require('../models/Requirement');

async function run() {
    try {
        await connectDB();

        console.log('🔌 Conectado a Mongo:');
        console.log(`- host: ${mongoose.connection.host}`);
        console.log(`- db:   ${mongoose.connection.name}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Colecciones existentes:', collections.map((c) => c.name).sort());

        const reqCol = Requirement.collection.name;
        const certCol = Certification.collection.name;
        const courseCol = Course.collection.name;

        console.log('🧹 Limpieza de catálogo:');
        console.log(`- Requirement -> ${reqCol}`);
        console.log(`- Certification -> ${certCol}`);
        console.log(`- Course -> ${courseCol}`);

        const delReq = await Requirement.deleteMany({});
        const delCert = await Certification.deleteMany({});
        const delCourse = await Course.deleteMany({});

        console.log(`✅ Deleted requirements: ${delReq.deletedCount}`);
        console.log(`✅ Deleted certifications: ${delCert.deletedCount}`);
        console.log(`✅ Deleted courses: ${delCourse.deletedCount}`);

        const remainingReq = await Requirement.countDocuments({});
        const remainingCert = await Certification.countDocuments({});
        const remainingCourse = await Course.countDocuments({});

        console.log(`📊 Remaining requirements: ${remainingReq}`);
        console.log(`📊 Remaining certifications: ${remainingCert}`);
        console.log(`📊 Remaining courses: ${remainingCourse}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando clearCatalog:', err);
        try {
            await mongoose.connection.close();
        } catch (e) {
            null;
        }
        process.exit(1);
    }
}

run();