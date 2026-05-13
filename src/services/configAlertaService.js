// src/services/configAlertaService.js

/**
 * Obtiene los días de anticipación guardados o devuelve 5 por defecto.
 */
export const obtenerDiasConfig = () => {
    const guardado = localStorage.getItem('dias_anticipacion_alerta');
    return guardado ? parseInt(guardado) : 5;
};

/**
 * Guarda el nuevo número de días en el navegador.
 */
export const guardarDiasConfig = (dias) => {
    localStorage.setItem('dias_anticipacion_alerta', dias.toString());
};