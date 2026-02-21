/* src/scripts/seedClean.js */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');

const Course = require('../models/Course');
const Certification = require('../models/Certification');
const Requirement = require('../models/Requirement');

const OWNER_UNITS = [
    'Facultad de Ingeniería',
    'Facultad de Economía y Negocios',
    'Facultad de Comunicaciones',
    'DFED',
    'Globalización',
    'FARO',
    'ExploraTec',
];

const CAMPUSES = ['Santiago', 'Concepción'];

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

function slugUnit(unit) {
    return String(unit)
        .toUpperCase()
        .replace(/[ÁÀÄ]/g, 'A')
        .replace(/[ÉÈË]/g, 'E')
        .replace(/[ÍÌÏ]/g, 'I')
        .replace(/[ÓÒÖ]/g, 'O')
        .replace(/[ÚÙÜ]/g, 'U')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 12);
}

function makeCourseCode(unitSlug, n) {
    const num = String(n).padStart(3, '0');
    return `${unitSlug}-${num}`;
}

function makeCertificationName(unit, campus, n) {
    const suffix = String(n).padStart(2, '0');
    return `Certificación ${unit} · ${campus} · ${suffix}`;
}

function makePriceCLP() {
    /*
        Precio al azar entre 10.000 y 20.000 CLP.
        Si lo quieres como 10–20 “sin miles”, cambia a randInt(10, 20).
    */
    return randInt(10000, 20000);
}

function creditsForCertification() {
    const options = [20, 24, 28];
    return options[randInt(0, options.length - 1)];
}

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

        console.log('🧹 Limpieza de colecciones (por nombre real):');
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

        if (remainingCourse > 0) {
            console.log('⚠️ Aún quedan cursos. Intentando dropCollection como fallback...');

            try {
                await mongoose.connection.db.dropCollection(courseCol);
                console.log(`✅ dropCollection OK: ${courseCol}`);
            } catch (e) {
                console.log(`❌ dropCollection falló para ${courseCol}:`, e.message);
            }
        }

        console.log('📚 Creando cursos...');
        const coursesToInsert = [];

        /*
            Pool por unidad:
            - 28 cursos por unidad (suficiente para repartir obligatorios/electivos
              entre 8 certificaciones por unidad sin duplicaciones raras).
        */
        const coursesByUnit = new Map();

        for (const unit of OWNER_UNITS) {
            const unitSlug = slugUnit(unit);
            const unitCourses = [];

            for (let i = 1; i <= 28; i += 1) {
                const courseCode = makeCourseCode(unitSlug, i);
                const credits = [2, 3, 4, 5][randInt(0, 3)];
                const name = `Curso ${unit} ${String(i).padStart(2, '0')}`;
                const area = unit;

                const courseDoc = {
                    courseCode,
                    name,
                    credits,
                    area,
                };

                unitCourses.push(courseDoc);
                coursesToInsert.push(courseDoc);
            }

            coursesByUnit.set(unit, unitCourses);
        }

        const createdCourses = await Course.insertMany(coursesToInsert, { ordered: false });
        console.log(`✅ Cursos creados: ${createdCourses.length}`);

        const courseIdByCode = new Map();
        createdCourses.forEach((c) => {
            courseIdByCode.set(String(c.courseCode), c._id);
        });

        console.log('🎓 Creando certificaciones...');
        const certsToInsert = [];

        /*
            4 certificaciones por unidad por campus:
            total = 7 unidades * 2 campus * 4 = 56
        */
        let certCodeCounter = 1001;

        const certMeta = [];
        for (const unit of OWNER_UNITS) {
            for (const campus of CAMPUSES) {
                for (let i = 1; i <= 4; i += 1) {
                    const certCode = certCodeCounter;
                    certCodeCounter += 1;

                    const certDoc = {
                        certCode,
                        name: makeCertificationName(unit, campus, i),
                        campus,
                        ownerUnit: unit,
                        price: makePriceCLP(),
                    };

                    certsToInsert.push(certDoc);
                    certMeta.push({
                        certCode,
                        campus,
                        ownerUnit: unit,
                    });
                }
            }
        }

        const createdCerts = await Certification.insertMany(certsToInsert, { ordered: false });
        console.log(`✅ Certificaciones creadas: ${createdCerts.length}`);

        const certIdByCode = new Map();
        createdCerts.forEach((c) => {
            certIdByCode.set(Number(c.certCode), c._id);
        });

        console.log('📋 Creando requerimientos...');
        const requirementsToInsert = [];

        /*
            Requerimientos por certificación:
            - group 1: CREDITS (único, condition Y)
            - group 2: 4 cursos obligatorios (condition Y)
            - group 3: 4 cursos electivos (condition O)
        */
        for (const meta of certMeta) {
            const certificationId = certIdByCode.get(Number(meta.certCode));
            if (!certificationId) {
                throw new Error(`No encontré _id para certCode ${meta.certCode}`);
            }

            const unitCourses = coursesByUnit.get(meta.ownerUnit) || [];
            const unitCourseCodes = unitCourses.map((c) => String(c.courseCode));

            const creditsRequired = creditsForCertification();

            requirementsToInsert.push({
                certificationId,
                group: 1,
                condition: 'Y',
                type: 'CREDITS',
                creditsRequired,
                courseId: null,
            });

            const mandatoryCodes = pickUnique(unitCourseCodes, 4);
            const remaining = unitCourseCodes.filter((code) => !mandatoryCodes.includes(code));
            const electiveCodes = pickUnique(remaining, 4);

            mandatoryCodes.forEach((courseCode) => {
                const courseId = courseIdByCode.get(String(courseCode));
                requirementsToInsert.push({
                    certificationId,
                    group: 2,
                    condition: 'Y',
                    type: 'COURSE',
                    courseId: courseId || null,
                    creditsRequired: null,
                });
            });

            electiveCodes.forEach((courseCode) => {
                const courseId = courseIdByCode.get(String(courseCode));
                requirementsToInsert.push({
                    certificationId,
                    group: 3,
                    condition: 'O',
                    type: 'COURSE',
                    courseId: courseId || null,
                    creditsRequired: null,
                });
            });
        }

        const createdReqs = await Requirement.insertMany(requirementsToInsert, { ordered: false });
        console.log(`✅ Requerimientos creados: ${createdReqs.length}`);

        console.log('🎉 Seed limpio finalizado OK');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando seedClean:', err);
        try {
            await mongoose.connection.close();
        } catch (e) {
            null;
        }
        process.exit(1);
    }
}

run();