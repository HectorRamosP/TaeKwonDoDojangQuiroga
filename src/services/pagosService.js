import api from './api';

/**
 * Obtiene la lista de pagos con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {number} [filtros.alumnoId] - ID del alumno.
 * @param {number} [filtros.conceptoId] - ID del concepto.
 * @param {string} [filtros.estado] - Estado del pago.
 * @param {string} [filtros.fechaInicio] - Fecha de inicio del rango (ISO).
 * @param {string} [filtros.fechaFin] - Fecha de fin del rango (ISO).
 * @returns {Promise<Array>} Lista de pagos.
 */
export const obtenerPagos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.conceptoId) params.append('conceptoId', filtros.conceptoId);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await api.get(`/pagos?${params.toString()}`);
  return response.data;
};

/**
 * Obtiene un pago por su ID.
 *
 * @param {number} id - ID del pago.
 * @returns {Promise<object>} Datos del pago.
 */
export const obtenerPago = async (id) => {
  const response = await api.get(`/pagos/${id}`);
  return response.data;
};

/**
 * Registra un nuevo pago en el sistema.
 *
 * @param {object} pago - Datos del pago a registrar.
 * @param {number} pago.alumnoId - ID del alumno.
 * @param {number} pago.conceptoId - ID del concepto.
 * @param {number} pago.monto - Monto del pago.
 * @param {string} pago.metodoPago - Método de pago (Efectivo, Tarjeta, Transferencia).
 * @param {string} [pago.referencia] - Referencia o folio del pago.
 * @param {string} [pago.notas] - Notas adicionales.
 * @returns {Promise<object>} Pago registrado.
 */
export const registrarPago = async (pago) => {
  const response = await api.post('/pagos', pago);
  return response.data;
};

/**
 * Modifica un pago existente.
 *
 * @param {number} id - ID del pago a modificar.
 * @param {object} pago - Datos actualizados del pago.
 * @returns {Promise<object>} Pago actualizado.
 */
export const modificarPago = async (id, pago) => {
  const response = await api.put(`/pagos/${id}`, pago);
  return response.data;
};

/**
 * Elimina un pago por su ID.
 *
 * @param {number} id - ID del pago a eliminar.
 * @returns {Promise<object>} Resultado de la operación.
 */
export const eliminarPago = async (id) => {
  const response = await api.delete(`/pagos/${id}`);
  return response.data;
};

/**
 * Obtiene estadísticas de pagos en un rango de fechas.
 *
 * @param {object} [filtros={}] - Filtros para las estadísticas.
 * @param {string} [filtros.fechaInicio] - Fecha de inicio (ISO).
 * @param {string} [filtros.fechaFin] - Fecha de fin (ISO).
 * @returns {Promise<object>} Estadísticas de pagos.
 */
export const obtenerEstadisticasPagos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await api.get(`/pagos/estadisticas?${params.toString()}`);
  return response.data;
};
