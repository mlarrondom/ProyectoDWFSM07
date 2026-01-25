const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const userRoutes = require('./routes/userRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Swagger config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Proyecto M06 - Certifications API',
            version: '1.0.0',
            description:
                'API REST para gestión de usuarios y certificaciones (M06)',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'], // ajusta si tu estructura es distinta
};

const specs = swaggerJsdoc(swaggerOptions);

// Conexión DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger routes (antes del listen)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/openapi.json', (req, res) => res.json(specs));

// Rutas
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certifications', certificationRoutes);

// Ruta de salud
app.get('/', (req, res) => {
    res.send('API ProyectoM06 - Certificaciones funcionando');
});

// Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
