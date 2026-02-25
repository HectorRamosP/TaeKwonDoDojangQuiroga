import api from './api';

/**
 * Obtiene la lista de cintas de Taekwondo con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {boolean} [filtros.activo] - Si es true, devuelve solo cintas activas.
 * @returns {Promise<Array>} Lista de cintas.
 */
export const obtenerCintas = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);

    const queryString = params.toString();
    const response = await api.get(`/cintas${queryString ? '?' + queryString : ''}`);
    return response.data;
};

/**
 * Obtiene una cinta por su ID.
 *
 * @param {number} id - ID de la cinta.
 * @returns {Promise<object>} Datos de la cinta.
 */
export const obtenerCintaPorId = async (id) => {
    const response = await api.get(`/cintas/${id}`);
    return response.data;
};
