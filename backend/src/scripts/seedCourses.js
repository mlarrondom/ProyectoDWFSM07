/* src/scripts/seedCourses.js */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');

const Course = require('../models/Course');
const Certification = require('../models/Certification');
const Requirement = require('../models/Requirement');

const OWNER_UNITS = [
    { unit: 'Facultad de Ingeniería', prefix: 'ING' },
    { unit: 'Facultad de Economía y Negocios', prefix: 'NEG' },
    { unit: 'Facultad de Comunicaciones', prefix: 'COM' },
    { unit: 'DFED', prefix: 'DFE' },
    { unit: 'Globalización', prefix: 'GLO' },
    { unit: 'FARO', prefix: 'FAR' },
    { unit: 'ExploraTec', prefix: 'EXP' },
];

function pad3(n) {
    return String(n).padStart(3, '0');
}

function creditsPattern(idx) {
    return idx % 2 === 0 ? 6 : 8;
}

function buildCourses() {
    const templates = {
        'Facultad de Ingeniería': [
            'Arquitectura de Aplicaciones Web',
            'Backend con Node.js',
            'Frontend con React',
            'APIs REST y Buenas Prácticas',
            'Bases de Datos para Aplicaciones',
            'Seguridad y Autenticación (JWT)',
            'Calidad de Software y Testing',
            'DevOps y Despliegue',
            'Patrones de Diseño Aplicados',
            'Integración de Servicios (SDK/APIs)',
            'Diseño de Sistemas Escalables',
            'Fundamentos de Cloud Computing',
        ],
        'Facultad de Economía y Negocios': [
            'Análisis de Datos para Negocios',
            'Modelamiento de Decisiones',
            'Finanzas para la Gestión',
            'Marketing Estratégico',
            'Estrategia Competitiva',
            'Gestión Comercial',
            'Contabilidad para la Toma de Decisiones',
            'Economía Aplicada',
            'Business Intelligence',
            'Gestión de Operaciones',
            'Gestión del Cambio Organizacional',
            'Innovación y Emprendimiento',
        ],
        'Facultad de Comunicaciones': [
            'Comunicación Corporativa',
            'Estrategias de Contenidos',
            'Storytelling y Narrativa',
            'Comunicación Digital',
            'Gestión de Marca',
            'Relaciones Públicas',
            'Comunicación de Crisis',
            'Producción Audiovisual',
            'Planificación de Medios',
            'Investigación de Audiencias',
            'Comunicación Interna',
            'Campañas Integradas',
        ],
        DFED: [
            'Didáctica y Evaluación del Aprendizaje',
            'Diseño Instruccional',
            'Metodologías Activas',
            'Innovación en Docencia',
            'Evaluación por Competencias',
            'Tecnología Educativa',
            'Gestión Curricular',
            'Acompañamiento y Tutorías',
            'Inclusión y Diversidad',
            'Analítica de Aprendizaje',
            'Diseño de Experiencias Formativas',
            'Taller de Prácticas Docentes',
        ],
        Globalización: [
            'Entornos Globales e Interculturalidad',
            'Geopolítica y Tendencias Globales',
            'Negocios Internacionales',
            'Cooperación y Desarrollo',
            'Competencias Globales',
            'Gestión Multicultural',
            'Comunicación Intercultural',
            'Economía Internacional',
            'Sostenibilidad Global',
            'Movilidad y Redes Globales',
            'Gobernanza y Organismos Internacionales',
            'Taller de Casos Globales',
        ],
        FARO: [
            'Pensamiento Crítico',
            'Ética y Sociedad',
            'Ciudadanía y Participación',
            'Liderazgo Personal',
            'Habilidades Socioemocionales',
            'Trabajo Colaborativo',
            'Comunicación Efectiva',
            'Gestión del Tiempo y Productividad',
            'Taller de Reflexión y Propósito',
            'Innovación Social',
            'Resolución de Conflictos',
            'Taller de Competencias Transversales',
        ],
        ExploraTec: [
            'Introducción a Tecnologías Emergentes',
            'Inteligencia Artificial Aplicada',
            'Automatización de Procesos',
            'Prototipado Rápido',
            'Diseño de Productos Digitales',
            'Internet de las Cosas (IoT)',
            'Ciberseguridad Fundamental',
            'Datos y Visualización',
            'Herramientas No-Code / Low-Code',
            'Gestión de Productos',
            'Laboratorio de Innovación',
            'Taller de Proyectos Tecnológicos',
        ],
    };

    const courses = [];

    OWNER_UNITS.forEach(({ unit, prefix }) => {
        const names = templates[unit];
        names.forEach((name, idx) => {
            courses.push({
                courseCode: `${prefix}${pad3(idx + 1)}`,
                name,
                credits: creditsPattern(idx),
                area: unit,
            });
        });
    });

    return courses;
}

async function run() {
    try {
        await connectDB();

        console.log('🔌 Conectado a Mongo:');
        console.log(`- host: ${mongoose.connection.host}`);
        console.log(`- db:   ${mongoose.connection.name}`);

        const certCount = await Certification.countDocuments({});
        const reqCount = await Requirement.countDocuments({});

        if (certCount > 0 || reqCount > 0) {
            console.log('❌ Seguridad: la base no está limpia para cargar solo cursos.');
            console.log(`- certifications: ${certCount}`);
            console.log(`- requirements:   ${reqCount}`);
            console.log('Limpia primero certifications/requirements y vuelve a ejecutar.');
            await mongoose.connection.close();
            process.exit(1);
        }

        const delCourses = await Course.deleteMany({});
        console.log(`🧹 Courses eliminados: ${delCourses.deletedCount}`);

        const courses = buildCourses();

        const created = await Course.insertMany(courses, { ordered: false });
        console.log(`✅ Courses creados: ${created.length}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando seedCourses:', err);
        try {
            await mongoose.connection.close();
        } catch (e) {
            null;
        }
        process.exit(1);
    }
}

run();