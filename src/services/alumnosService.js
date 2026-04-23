/** @module services/alumnos */
import api from './api';
import { buildQueryString } from '../utils/buildQueryString';

/**
 * Obtiene la lista de alumnos con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {string} [filtros.nombre] - Nombre del alumno a buscar.
 * @param {boolean} [filtros.activo] - Estado del alumno (activo/inactivo).
 * @param {number} [filtros.cintaId] - ID de la cinta para filtrar.
 * @param {number} [filtros.claseId] - ID de la clase para filtrar.
 * @returns {Promise<Array>} Lista de alumnos.
 */
export const obtenerAlumnos = async (filtros = {}) => {
    const qs = buildQueryString(filtros);
    const response = await api.get(`/alumnos${qs ? '?' + qs : ''}`);
    return response.data;
};

/**
 * Obtiene un alumno por su slug único.
 *
 * @param {string} slug - Identificador único del alumno.
 * @returns {Promise<object>} Datos del alumno.
 */
export const obtenerAlumnoPorSlug = async (slug) => {
    const response = await api.get(`/alumnos/${slug}`);
    return response.data;
};

/**
 * Registra un nuevo alumno en el sistema.
 *
 * @param {object} alumno - Datos del alumno a registrar.
 * @returns {Promise<object>} Alumno creado.
 */
export const crearAlumno = async (alumno) => {
    const response = await api.post('/alumnos', alumno);
    return response.data;
};

/**
 * Actualiza los datos de un alumno existente.
 *
 * @param {string} slug - Identificador único del alumno.
 * @param {object} alumno - Datos actualizados del alumno.
 * @returns {Promise<object>} Alumno actualizado.
 */
export const actualizarAlumno = async (slug, alumno) => {
    const response = await api.put(`/alumnos/${slug}`, alumno);
    return response.data;
};

/**
 * Cambia el estado activo/inactivo de un alumno.
 *
 * @param {string} slug - Identificador único del alumno.
 * @param {boolean} activo - Nuevo estado del alumno.
 * @returns {Promise<object>} Resultado de la operación.
 */
export const cambiarEstadoAlumno = async (slug, activo) => {
    const response = await api.patch(`/alumnos/${slug}/estado`, { slug, activo });
    return response.data;
};

/**
 * Obtiene las alertas de vencimiento de alumnos en los próximos días.
 *
 * @returns {Promise<Array>} Lista de alumnos próximos a vencer.
 */
export const obtenerAlertasVencimiento = async () => {
    const response = await api.get('/alumnos/alertas-vencimiento');
    return response.data;
};
