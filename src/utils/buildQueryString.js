/** @module utils/buildQueryString */

/**
 * Construye un query string a partir de un objeto de filtros,
 * omitiendo valores undefined, null y cadenas vacías.
 * Los valores booleanos (como activo=false) sí se incluyen.
 *
 * @param {object} [filtros={}] - Objeto con los parámetros a serializar.
 * @returns {string} Query string listo para concatenar a una URL (sin el "?").
 *
 * @example
 * buildQueryString({ activo: true, nombre: "Juan", extra: undefined })
 * // → "activo=true&nombre=Juan"
 */
export function buildQueryString(filtros = {}) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") {
            params.append(clave, valor);
        }
    });
    return params.toString();
}
