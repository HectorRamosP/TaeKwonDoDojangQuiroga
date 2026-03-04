import api from './api';

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
  const params = new URLSearchParams();

  if (filtros.claseId) params.append('claseId', filtros.claseId);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.fecha) params.append('fecha', filtros.fecha);

  const response = await api.get(`/asistencias?${params.toString()}`);
  // El backend puede devolver { success, data, message } o directamente el array.
  // response.data?.data cubre el formato envuelto; response.data cubre el array directo.
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
