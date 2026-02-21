const { CAMPUSES, OWNER_UNITS } = require('../models/Certification');

/**
 * Helpers seguros para elegir campus y ownerUnit
 * sin inventar valores
 */
const pickCampus = (regex, fallbackIdx) =>
    CAMPUSES.find((c) => regex.test(String(c))) ??
    CAMPUSES[fallbackIdx] ??
    CAMPUSES[0];

const campusSantiago = pickCampus(/santiago/i, 0);
const campusConcepcion = pickCampus(/concep/i, 1);

const ownerUnitDefault = OWNER_UNITS[0];

module.exports = [
    // ===== Santiago (8) =====
    {
        certCode: 1001,
        name: 'Programación Web Frontend',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1002,
        name: 'Desarrollo Backend con Node.js',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1003,
        name: 'Bases de Datos para Aplicaciones Web',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1004,
        name: 'Marketing Digital y Analítica',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1005,
        name: 'SEO y Contenidos',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1006,
        name: 'Fundamentos de Ciencias Médicas',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1007,
        name: 'Salud Pública y Epidemiología',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 1008,
        name: 'Escritura y Análisis Literario',
        campus: campusSantiago,
        ownerUnit: ownerUnitDefault,
    },

    // ===== Concepción (8) =====
    {
        certCode: 2001,
        name: 'Programación Web Full Stack',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2002,
        name: 'Frameworks Frontend Modernos',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2003,
        name: 'Arquitectura de Bases de Datos',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2004,
        name: 'Automatización de Marketing',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2005,
        name: 'Paid Media y Performance',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2006,
        name: 'Introducción a la Farmacología',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2007,
        name: 'Epidemiología Aplicada',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
    {
        certCode: 2008,
        name: 'Escritura Creativa',
        campus: campusConcepcion,
        ownerUnit: ownerUnitDefault,
    },
];
