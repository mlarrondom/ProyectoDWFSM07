const mongoose = require('mongoose');

const CAMPUSES = ['Santiago', 'Concepción'];

const OWNER_UNITS = [
    'Facultad de Ingeniería',
    'Facultad de Economía y Negocios',
    'Facultad de Comunicaciones',
    'DFED',
    'Globalización',
    'FARO',
    'EsploraTec',
];

const certificationSchema = new mongoose.Schema(
    {
        certCode: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        campus: {
            type: String,
            required: true,
            enum: CAMPUSES,
        },
        ownerUnit: {
            type: String,
            required: true,
            enum: OWNER_UNITS,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

const Certification = mongoose.model('Certification', certificationSchema);

Certification.CAMPUSES = CAMPUSES;
Certification.OWNER_UNITS = OWNER_UNITS;

module.exports = Certification;
