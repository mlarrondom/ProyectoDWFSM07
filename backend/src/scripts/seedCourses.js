require('dotenv').config();
const mongoose = require('mongoose');

const Course = require('../models/Course');
const courses = require('../data/courses.seed');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado (seed)');

        // Limpia y vuelve a cargar (para que sea repetible)
        await Course.deleteMany({});
        await Course.insertMany(courses);

        console.log(`Seed OK: ${courses.length} cursos cargados`);
        process.exit(0);
    } catch (error) {
        console.error('Seed ERROR:', error.message);
        process.exit(1);
    }
};

run();
