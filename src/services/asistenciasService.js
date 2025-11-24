import api from './api';

export const obtenerAsistencias = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.claseId) params.append('claseId', filtros.claseId);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.fecha) params.append('fecha', filtros.fecha);

  const response = await api.get(`/asistencias?${params.toString()}`);
  // El backend devuelve { success, data, message }, necesitamos acceder a .data
  return response.data?.data || response.data || [];
};

export const obtenerAsistenciaPorId = async (id) => {
  const response = await api.get(`/asistencias/${id}`);
  return response.data;
};

export const registrarAsistencia = async (asistencia) => {
  const response = await api.post('/asistencias', asistencia);
  return response.data;
};

export const registrarAsistenciasMasivas = async (datos) => {
  const response = await api.post('/asistencias/masivas', datos);
  return response.data;
};

export const contarFaltas = async (alumnoId, fechaInicio, fechaFin) => {
  const params = new URLSearchParams({
    alumnoId,
    fechaInicio: fechaInicio.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0]
  });

  const response = await api.get(`/asistencias/faltas?${params.toString()}`);
  return response.data;
};

export const eliminarAsistenciasPorClaseYFecha = async (claseId, fecha) => {
  // Asegurar que la fecha está en formato ISO completo
  const fechaISO = fecha.includes('T') ? fecha : `${fecha}T00:00:00`;

  const url = `/asistencias/clase/${claseId}/fecha/${encodeURIComponent(fechaISO)}`;
  console.log('DELETE URL:', url);
  console.log('Params:', { claseId, fecha: fechaISO });

  const response = await api.delete(url);
  return response.data;
};
