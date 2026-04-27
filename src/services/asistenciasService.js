/** @module services/asistencias */
import api from './api';
import { buildQueryString } from '../utils/buildQueryString';

/**
 * Obtiene la lista de asistencias con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {number} [filtros.claseId] - ID de la clase.
 * @param {number} [filtros.alumnoId] - ID del alumno.
 * @param {string} [filtros.fecha] - Fecha de la asistencia (ISO).
 * @returns {Promise<Array>} Lista de asistencias.
 */
export const obtenerAsistencias = async (filtros = {}) => {
  const qs = buildQueryString(filtros);
  const response = await api.get(`/asistencias${qs ? '?' + qs : ''}`);
  return response.data?.data || response.data || [];
};

/**
 * Obtiene una asistencia por su ID.
 *
 * @param {number} id - ID de la asistencia.
 * @returns {Promise<object>} Datos de la asistencia.
 */
export const obtenerAsistenciaPorId = async (id) => {
  const response = await api.get(`/asistencias/${id}`);
  return response.data;
};

/**
 * Registra una asistencia individual para un alumno en una clase.
 *
 * @param {object} asistencia - Datos de la asistencia a registrar.
 * @param {number} asistencia.alumnoId - ID del alumno.
 * @param {number} asistencia.claseId - ID de la clase.
 * @param {string} asistencia.fecha - Fecha de la asistencia (ISO).
 * @returns {Promise<object>} Asistencia registrada.
 */
export const registrarAsistencia = async (asistencia) => {
  const response = await api.post('/asistencias', asistencia);
  return response.data;
};

/**
 * Registra asistencias de forma masiva para una clase en una fecha determinada.
 *
 * @param {object} datos - Datos para el registro masivo.
 * @param {number} datos.claseId - ID de la clase.
 * @param {string} datos.fecha - Fecha de la asistencia (ISO).
 * @param {Array<number>} datos.alumnoIds - IDs de los alumnos presentes.
 * @returns {Promise<object>} Resultado del registro masivo.
 */
export const registrarAsistenciasMasivas = async (datos) => {
  const response = await api.post('/asistencias/masivas', datos);
  return response.data;
};

/**
 * Cuenta las faltas de un alumno en un rango de fechas.
 *
 * @param {number} alumnoId - ID del alumno.
 * @param {Date} fechaInicio - Fecha de inicio del rango.
 * @param {Date} fechaFin - Fecha de fin del rango.
 * @returns {Promise<object>} Número de faltas en el rango especificado.
 */
export const contarFaltas = async (alumnoId, fechaInicio, fechaFin) => {
  const params = new URLSearchParams({
    alumnoId,
    // toISOString() devuelve "YYYY-MM-DDTHH:mm:ss.sssZ"; con split('T')[0] se envía solo la fecha
    fechaInicio: fechaInicio.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0]
  });

  const response = await api.get(`/asistencias/faltas?${params.toString()}`);
  return response.data;
};

/**
 * Elimina todas las asistencias registradas de una clase en una fecha específica.
 *
 * @param {number} claseId - ID de la clase.
 * @param {string} fecha - Fecha en formato ISO o YYYY-MM-DD.
 * @returns {Promise<object>} Resultado de la operación.
 */
/**
 * Obtiene todas las asistencias de un alumno específico.
 *
 * @param {number} alumnoId - ID del alumno.
 * @returns {Promise<Array>} Lista de asistencias del alumno.
 */
export const obtenerAsistenciasPorAlumno = async (alumnoId) => {
  const response = await api.get(`/asistencias?alumnoId=${alumnoId}`);
  return response.data?.data || response.data || [];
};

export const eliminarAsistenciasPorClaseYFecha = async (claseId, fecha) => {
  // Asegurar que la fecha está en formato ISO completo
  const fechaISO = fecha.includes('T') ? fecha : `${fecha}T00:00:00`;

  // encodeURIComponent codifica los ':' del timestamp para que no rompan la URL
  const url = `/asistencias/clase/${claseId}/fecha/${encodeURIComponent(fechaISO)}`;
  console.log('DELETE URL:', url);
  console.log('Params:', { claseId, fecha: fechaISO });

  const response = await api.delete(url);
  return response.data;
};

/**
 * Justifica o quita la justificación de una falta.
 *
 * @param {number} asistenciaId - ID del registro de asistencia.
 * @param {boolean} justificada - true para justificar, false para quitar.
 * @returns {Promise<object>}
 */
export const justificarFalta = async (asistenciaId, justificada) => {
  const response = await api.patch(`/asistencias/${asistenciaId}/justificar`, { justificada });
  return response.data;
};
