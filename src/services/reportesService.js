/** @module services/reportes */
import api from './api';
import { buildQueryString } from '../utils/buildQueryString';

/**
 * Genera un reporte de pagos con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para el reporte.
 * @param {string} [filtros.fechaInicio] - Fecha de inicio del rango (ISO).
 * @param {string} [filtros.fechaFin] - Fecha de fin del rango (ISO).
 * @param {number} [filtros.alumnoId] - ID del alumno a filtrar.
 * @param {number} [filtros.conceptoId] - ID del concepto a filtrar.
 * @param {string} [filtros.estado] - Estado del pago a filtrar.
 * @param {string} [filtros.metodoPago] - Método de pago a filtrar.
 * @returns {Promise<object>} Datos del reporte de pagos.
 */
export const generarReportePagos = async (filtros = {}) => {
  const qs = buildQueryString(filtros);
  const response = await api.get(`/reportes/pagos${qs ? '?' + qs : ''}`);
  return response.data;
};

/**
 * Genera un reporte de estudiantes con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para el reporte.
 * @param {number} [filtros.cintaId] - ID de la cinta para filtrar alumnos.
 * @param {number} [filtros.claseId] - ID de la clase para filtrar alumnos.
 * @returns {Promise<object>} Datos del reporte de estudiantes.
 */
export const generarReporteEstudiantes = async (filtros = {}) => {
  const qs = buildQueryString(filtros);
  const response = await api.get(`/reportes/estudiantes${qs ? '?' + qs : ''}`);
  return response.data;
};

/**
 * Genera un reporte de asistencias con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para el reporte.
 * @param {string} [filtros.fechaInicio] - Fecha de inicio del rango (ISO).
 * @param {string} [filtros.fechaFin] - Fecha de fin del rango (ISO).
 * @param {number} [filtros.alumnoId] - ID del alumno a filtrar.
 * @param {number} [filtros.claseId] - ID de la clase a filtrar.
 * @returns {Promise<object>} Datos del reporte de asistencias.
 */
export const generarReporteAsistencias = async (filtros = {}) => {
  const qs = buildQueryString(filtros);
  const response = await api.get(`/reportes/asistencias${qs ? '?' + qs : ''}`);
  return response.data;
};

/**
 * Genera un reporte de todos los conceptos de pago registrados en el sistema.
 *
 * @returns {Promise<object>} Datos del reporte de conceptos.
 */
export const generarReporteConceptos = async () => {
  const response = await api.get('/reportes/conceptos');
  return response.data;
};

/**
 * Genera un reporte de todas las clases registradas en el sistema.
 *
 * @returns {Promise<object>} Datos del reporte de clases.
 */
export const generarReporteClases = async () => {
  const response = await api.get('/reportes/clases');
  return response.data;
};
