/** @module utils/manejarErrorApi */
import Swal from "sweetalert2";

/**
 * Maneja errores de peticiones a la API mostrando alertas con SweetAlert2.
 * Interpreta el código HTTP de la respuesta y muestra un mensaje descriptivo al usuario.
 *
 * @param {Error} error - El error capturado del bloque catch.
 * @param {string} [contexto="la operación"] - Descripción de la acción que falló (ej. "crear alumno").
 * @returns {void}
 *
 * @example
 * try {
 *   await axios.post('/api/alumnos', datos);
 * } catch (error) {
 *   manejarErrorApi(error, "crear alumno");
 * }
 */
export function manejarErrorApi(error, contexto = "la operación") {
    let titulo = "Error inesperado";
    let detalle = `Ocurrió un error al ${contexto}`;

    if (error.response) {
        const data = error.response.data;
        // La API devuelve { mensaje, detalles } desde el ManejadorExcepcionesGlobal
        const mensajeApi = data?.mensaje || data?.message;
        const detallesApi = data?.detalles;

        switch (error.response.status) {
            case 400:
                titulo = "Datos inválidos";
                detalle = mensajeApi || "Verifica que todos los datos sean correctos";
                if (detallesApi && detallesApi.length > 0) {
                    detalle += "\n" + detallesApi.join("\n");
                }
                break;
            case 404:
                titulo = "No encontrado";
                detalle = mensajeApi || "El recurso solicitado no existe";
                break;
            case 409:
                titulo = "Dato duplicado";
                detalle = mensajeApi || "Ya existe un registro con estos datos";
                break;
            default:
                titulo = "Error del servidor";
                detalle = mensajeApi || `No se pudo ${contexto}. Intenta nuevamente.`;
                break;
        }
    } else if (error.request) {
        titulo = "Sin conexión";
        detalle = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    }

    Swal.fire({
        icon: "error",
        title: titulo,
        text: detalle,
        confirmButtonColor: "#d32f2f",
        customClass: {
            popup: 'swal-sobre-modal',
            container: 'swal-sobre-modal-container',
        },
    });
}
