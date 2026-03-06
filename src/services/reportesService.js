/** @module services/reportes */
import api from './api';

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
  const params = new URLSearchParams();

  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.conceptoId) params.append('conceptoId', filtros.conceptoId);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.metodoPago) params.append('metodoPago', filtros.metodoPago);

  const response = await api.get(`/reportes/pagos?${params.toString()}`);
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
  const params = new URLSearchParams();

  if (filtros.cintaId) params.append('cintaId', filtros.cintaId);
  if (filtros.claseId) params.append('claseId', filtros.claseId);

  const response = await api.get(`/reportes/estudiantes?${params.toString()}`);
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
  const params = new URLSearchParams();

  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.claseId) params.append('claseId', filtros.claseId);

  const response = await api.get(`/reportes/asistencias?${params.toString()}`);
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
