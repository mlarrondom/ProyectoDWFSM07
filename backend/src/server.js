const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Conexión DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger config
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CERTIFY API (M07)',
            version: '1.0.0',
            description:
                'API REST para venta y gestión de certificaciones académicas (CERTIFY).',
        },
        servers: [
            {
                url:
                    process.env.API_BASE_URL ||
                    `http://localhost:${process.env.PORT || 4000}`,
                description: 'Servidor',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger routes (antes de las rutas API)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/openapi.json', (req, res) => res.json(specs));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/clients', clientRoutes);

// Ruta de salud
app.get('/', (req, res) => {
    res.send('API CERTIFY (M07) funcionando');
});

// Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
