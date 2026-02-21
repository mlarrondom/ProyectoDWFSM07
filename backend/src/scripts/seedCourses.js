const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Course = require('../models/Course');
const courses = require('../data/courses.seed');

async function run() {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error('❌ MONGO_URI no está definido. Revisa backend/.env');
            process.exit(1);
        }

        await mongoose.connect(uri);

        await Course.deleteMany({});
        await Course.insertMany(courses);

        console.log(`✅ Cursos cargados: ${courses.length}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seedCourses:', err);
        process.exit(1);
    }
}

run();
