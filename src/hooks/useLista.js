/** @module hooks/useLista */
import { useState, useEffect } from "react";

/**
 * Hook para gestionar listas con carga asíncrona, búsqueda por texto y paginación.
 *
 * @param {Function} fetchFn - Función async que retorna el array de datos.
 * @param {Function} camposBusqueda - Función(item) que retorna array de strings a buscar.
 * @param {number} [itemsPorPagina=10] - Cantidad de elementos por página.
 * @returns {object} Estado y funciones para controlar la lista.
 *
 * @example
 * const lista = useLista(
 *   () => obtenerClases(),
 *   (c) => [c.nombre, c.dias, c.tipoClase]
 * );
 */
export function useLista(fetchFn, camposBusqueda, itemsPorPagina = 10) {
    const [datos, setDatos] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [pagina, setPagina] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const recargar = async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await fetchFn();
            setDatos(data || []);
        } catch (err) {
            let mensaje = "Ocurrió un error inesperado.";
            if (err.response) mensaje = "Error al cargar los datos del servidor.";
            else if (err.request) mensaje = "No se pudo conectar con el servidor. Verifica tu conexión.";
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        recargar();
    }, []);

    useEffect(() => {
        setPagina(1);
    }, [filtro]);

    const filtrados = filtro
        ? datos.filter((item) =>
              camposBusqueda(item)
                  .join(" ")
                  .toLowerCase()
                  .includes(filtro.toLowerCase())
          )
        : datos;

    const indiceInicio = (pagina - 1) * itemsPorPagina;
    const datosPaginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);
    const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

    return {
        datos,
        filtro,
        setFiltro,
        pagina,
        setPagina,
        cargando,
        error,
        filtrados,
        datosPaginados,
        totalPaginas,
        recargar,
    };
}
