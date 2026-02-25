import api from './api';

/**
 * Obtiene la lista de clases con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {boolean} [filtros.activo] - Si es true, devuelve solo clases activas.
 * @param {string} [filtros.tipoClase] - Tipo de clase a filtrar.
 * @returns {Promise<Array>} Lista de clases.
 */
export const obtenerClases = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    if (filtros.tipoClase) params.append('tipoClase', filtros.tipoClase);

    const response = await api.get(`/clases?${params.toString()}`);
    return response.data;
};

/**
 * Obtiene una clase por su slug único.
 *
 * @param {string} slug - Identificador único de la clase.
 * @returns {Promise<object>} Datos de la clase.
 */
export const obtenerClasePorSlug = async (slug) => {
    const response = await api.get(`/clases/${slug}`);
    return response.data;
};

/**
 * Crea una nueva clase en el sistema.
 *
 * @param {object} clase - Datos de la clase a crear.
 * @returns {Promise<object>} Clase creada.
 */
export const crearClase = async (clase) => {
    const response = await api.post('/clases', clase);
    return response.data;
};

/**
 * Actualiza los datos de una clase existente.
 *
 * @param {string} slug - Identificador único de la clase.
 * @param {object} clase - Datos actualizados de la clase.
 * @returns {Promise<object>} Clase actualizada.
 */
export const actualizarClase = async (slug, clase) => {
    const response = await api.put(`/clases/${slug}`, clase);
    return response.data;
};

/**
 * Elimina una clase del sistema.
 *
 * @param {string} slug - Identificador único de la clase.
 * @returns {Promise<object>} Resultado de la operación.
 */
export const eliminarClase = async (slug) => {
    const response = await api.delete(`/clases/${slug}`);
    return response.data;
};
