/** @module services/conceptos */
import api from './api';
import { buildQueryString } from '../utils/buildQueryString';

/**
 * Obtiene la lista de conceptos de pago con filtros opcionales.
 *
 * @param {object} [filtros={}] - Filtros para la búsqueda.
 * @param {boolean} [filtros.activo] - Si es true, devuelve solo conceptos activos.
 * @param {string} [filtros.tipoConcepto] - Tipo de concepto a filtrar (ej. "Mensualidad").
 * @returns {Promise<Array>} Lista de conceptos.
 */
export const obtenerConceptos = async (filtros = {}) => {
    const qs = buildQueryString(filtros);
    const response = await api.get(`/conceptos${qs ? '?' + qs : ''}`);
    return response.data;
};

/**
 * Obtiene un concepto por su slug único.
 *
 * @param {string} slug - Identificador único del concepto.
 * @returns {Promise<object>} Datos del concepto.
 */
export const obtenerConceptoPorSlug = async (slug) => {
    const response = await api.get(`/conceptos/${slug}`);
    return response.data;
};

/**
 * Crea un nuevo concepto de pago en el sistema.
 *
 * @param {object} concepto - Datos del concepto a crear.
 * @returns {Promise<object>} Concepto creado.
 */
export const crearConcepto = async (concepto) => {
    const response = await api.post('/conceptos', concepto);
    return response.data;
};

/**
 * Actualiza los datos de un concepto existente.
 *
 * @param {string} slug - Identificador único del concepto.
 * @param {object} concepto - Datos actualizados del concepto.
 * @returns {Promise<object>} Concepto actualizado.
 */
export const actualizarConcepto = async (slug, concepto) => {
    const response = await api.put(`/conceptos/${slug}`, concepto);
    return response.data;
};

/**
 * Elimina un concepto de pago del sistema.
 *
 * @param {string} slug - Identificador único del concepto.
 * @returns {Promise<object>} Resultado de la operación.
 */
export const eliminarConcepto = async (slug) => {
    const response = await api.delete(`/conceptos/${slug}`);
    return response.data;
};
