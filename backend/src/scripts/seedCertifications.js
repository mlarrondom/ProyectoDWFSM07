/* src/scripts/seedCertifications.js */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../config/db');

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

function randPrice() {
    const options = [10, 15, 20];
    return options[Math.floor(Math.random() * options.length)];
}

function buildCertifications() {
    const namesByUnit = {
        'Facultad de Ingeniería': {
            Santiago: [
                'Certificación en Desarrollo Full Stack Profesional',
                'Certificación en Arquitectura de Software Escalable',
                'Certificación en DevOps y Despliegue Cloud',
                'Certificación en Integración de APIs y Microservicios',
            ],
            'Concepción': [
                'Certificación en Ingeniería de Sistemas Web',
                'Certificación en Diseño de Aplicaciones Empresariales',
                'Certificación en Backend Avanzado con Node.js',
                'Certificación en Seguridad y Autenticación de Aplicaciones',
            ],
        },
        'Facultad de Economía y Negocios': {
            Santiago: [
                'Certificación en Analítica y Toma de Decisiones',
                'Certificación en Estrategia y Gestión Comercial',
                'Certificación en Business Intelligence para Negocios',
                'Certificación en Innovación y Emprendimiento',
            ],
            'Concepción': [
                'Certificación en Gestión Financiera Aplicada',
                'Certificación en Marketing y Crecimiento',
                'Certificación en Operaciones y Productividad',
                'Certificación en Transformación Digital Empresarial',
            ],
        },
        'Facultad de Comunicaciones': {
            Santiago: [
                'Certificación en Comunicación Corporativa',
                'Certificación en Estrategias de Contenido Digital',
                'Certificación en Comunicación de Crisis',
                'Certificación en Campañas Integradas de Comunicación',
            ],
            'Concepción': [
                'Certificación en Comunicación Estratégica Digital',
                'Certificación en Storytelling y Narrativa Aplicada',
                'Certificación en Gestión de Marca y Reputación',
                'Certificación en Producción y Medios Audiovisuales',
            ],
        },
        DFED: {
            Santiago: [
                'Certificación en Diseño Instruccional',
                'Certificación en Evaluación por Competencias',
                'Certificación en Metodologías Activas',
                'Certificación en Tecnología Educativa Aplicada',
            ],
            'Concepción': [
                'Certificación en Innovación y Gestión Docente',
                'Certificación en Analítica de Aprendizaje',
                'Certificación en Inclusión y Diversidad en Aula',
                'Certificación en Diseño de Experiencias Formativas',
            ],
        },
        Globalización: {
            Santiago: [
                'Certificación en Entornos Globales e Interculturalidad',
                'Certificación en Negocios Internacionales',
                'Certificación en Geopolítica y Tendencias Globales',
                'Certificación en Sostenibilidad y Gobernanza Global',
            ],
            'Concepción': [
                'Certificación en Competencias Globales',
                'Certificación en Gestión Multicultural',
                'Certificación en Economía Internacional Aplicada',
                'Certificación en Taller de Casos Globales',
            ],
        },
        FARO: {
            Santiago: [
                'Certificación en Pensamiento Crítico',
                'Certificación en Liderazgo Personal',
                'Certificación en Ética y Sociedad',
                'Certificación en Habilidades Socioemocionales',
            ],
            'Concepción': [
                'Certificación en Competencias Transversales',
                'Certificación en Comunicación Efectiva',
                'Certificación en Ciudadanía y Participación',
                'Certificación en Innovación Social',
            ],
        },
        ExploraTec: {
            Santiago: [
                'Certificación en Tecnologías Emergentes',
                'Certificación en Automatización de Procesos',
                'Certificación en Datos y Visualización',
                'Certificación en Gestión de Productos Digitales',
            ],
            'Concepción': [
                'Certificación en Inteligencia Artificial Aplicada',
                'Certificación en Internet de las Cosas (IoT)',
                'Certificación en Ciberseguridad Fundamental',
                'Certificación en Laboratorio de Innovación Tecnológica',
            ],
        },
    };

    const certs = [];

    let santiagoCode = 1001;
    let conceCode = 2001;

    for (const unit of OWNER_UNITS) {
        const namesScl = namesByUnit[unit]?.Santiago || [];
        const namesCon = namesByUnit[unit]?.['Concepción'] || [];

        namesScl.forEach((name) => {
            certs.push({
                certCode: santiagoCode,
                name,
                campus: 'Santiago',
                ownerUnit: unit,
                price: randPrice(),
            });
            santiagoCode += 1;
        });

        namesCon.forEach((name) => {
            certs.push({
                certCode: conceCode,
                name,
                campus: 'Concepción',
                ownerUnit: unit,
                price: randPrice(),
            });
            conceCode += 1;
        });
    }

    return certs;
}

async function run() {
    try {
        await connectDB();

        console.log('🔌 Conectado a Mongo:');
        console.log(`- host: ${mongoose.connection.host}`);
        console.log(`- db:   ${mongoose.connection.name}`);

        console.log('🧹 Limpiando requirements y certifications (courses no se toca)...');
        const delReq = await Requirement.deleteMany({});
        const delCert = await Certification.deleteMany({});

        console.log(`✅ Deleted requirements: ${delReq.deletedCount}`);
        console.log(`✅ Deleted certifications: ${delCert.deletedCount}`);

        const certifications = buildCertifications();

        const created = await Certification.insertMany(certifications, { ordered: false });
        console.log(`✅ Certificaciones creadas: ${created.length}`);

        const sclCount = created.filter((c) => c.campus === 'Santiago').length;
        const conCount = created.filter((c) => c.campus === 'Concepción').length;

        console.log(`📊 Santiago: ${sclCount} (1001–1028)`);
        console.log(`📊 Concepción: ${conCount} (2001–2028)`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error ejecutando seedCertifications:', err);
        try {
            await mongoose.connection.close();
        } catch (e) {
            null;
        }
        process.exit(1);
    }
}

run();