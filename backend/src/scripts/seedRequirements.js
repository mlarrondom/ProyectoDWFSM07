/* src/scripts/seedRequirements.js */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');

const Course = require('../models/Course');
const Certification = require('../models/Certification');
const Requirement = require('../models/Requirement');

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickUnique(arr, count) {
    const copy = [...arr];
    const picked = [];
    while (picked.length < count && copy.length > 0) {
        const idx = randInt(0, copy.length - 1);
        picked.push(copy[idx]);
        copy.splice(idx, 1);
    }
    return picked;
}

function creditsRandom() {
    return Math.random() < 0.5 ? 24 : 30;
}

async function run() {
    try {
        await connectDB();

        console.log('🔌 Conectado a Mongo:');
        console.log(`- host: ${mongoose.connection.host}`);
        console.log(`- db:   ${mongoose.connection.name}`);

        const certCount = await Certification.countDocuments({});
        const courseCount = await Course.countDocuments({});

        if (certCount === 0) {
            console.log('❌ No hay certificaciones. Corre primero seedCertifications.js');
            await mongoose.connection.close();
            process.exit(1);
        }

        if (courseCount === 0) {
            console.log('❌ No hay cursos. Corre primero seedCourses.js');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('🧹 Eliminando requirements existentes...');
        const delReq = await Requirement.deleteMany({});
        console.log(`✅ Deleted requirements: ${delReq.deletedCount}`);

        console.log('📥 Cargando certificaciones...');
        const certifications = await Certification.find({})
            .select('_id certCode campus ownerUnit')
            .sort({ certCode: 1 });

        console.log(`✅ Certificaciones encontradas: ${certifications.length}`);

        console.log('📥 Cargando cursos...');
        const courses = await Course.find({})
            .select('_id courseCode area')
            .sort({ courseCode: 1 });

        const coursesByUnit = new Map();
        courses.forEach((c) => {
            const unit = String(c.area || '').trim();
            if (!coursesByUnit.has(unit)) {
                coursesByUnit.set(unit, []);
            }
            coursesByUnit.get(unit).push(c);
        });

        let totalRequirements = 0;
        const requirementsToInsert = [];

        console.log('🧩 Generando requirements (7 por certificación)...');

        for (const cert of certifications) {
            const unit = String(cert.ownerUnit).trim();
            const unitCourses = coursesByUnit.get(unit) || [];

            if (unitCourses.length < 6) {
                throw new Error(
                    `Unidad "${unit}" tiene solo ${unitCourses.length} cursos. Necesita >= 6 para (2 obligatorios + 4 electivos).`,
                );
            }

            const selected = pickUnique(unitCourses, 6);

            const mandatory = selected.slice(0, 2);
            const elective = selected.slice(2, 6);

            requirementsToInsert.push({
                certificationId: cert._id,
                group: 1,
                condition: 'Y',
                type: 'CREDITS',
                creditsRequired: creditsRandom(),
                courseId: null,
            });

            mandatory.forEach((course) => {
                requirementsToInsert.push({
                    certificationId: cert._id,
                    group: 2,
                    condition: 'Y',
                    type: 'COURSE',
                    courseId: course._id,
                    creditsRequired: null,
                });
            });

            elective.forEach((course) => {
                requirementsToInsert.push({
                    certificationId: cert._id,
                    group: 3,
                    condition: 'O',
                    type: 'COURSE',
                    courseId: course._id,
                    creditsRequired: null,
                });
            });

            totalRequirements += 7;
        }

        const created = await Requirement.insertMany(requirementsToInsert, { ordered: false });
        console.log(`✅ Requirements creados: ${created.length}`);
        console.log(`📊 Esperados: ${totalRequirements}`);

        console.log('🎉 Seed de requirements finalizado OK');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando seedRequirements:', err);
        try {
            await mongoose.connection.close();
        } catch (e) {
            null;
        }
        process.exit(1);
    }
}

run();