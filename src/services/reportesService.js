import api from './api';

export const generarReportePagos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.conceptoId) params.append('conceptoId', filtros.conceptoId);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.metodoPago) params.append('metodoPago', filtros.metodoPago);

  const response = await api.get(`/reportes/pagos?${params.toString()}`);
  return response.data;
};

export const generarReporteEstudiantes = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.cintaId) params.append('cintaId', filtros.cintaId);
  if (filtros.claseId) params.append('claseId', filtros.claseId);

  const response = await api.get(`/reportes/estudiantes?${params.toString()}`);
  return response.data;
};

export const generarReporteAsistencias = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.alumnoId) params.append('alumnoId', filtros.alumnoId);
  if (filtros.claseId) params.append('claseId', filtros.claseId);

  const response = await api.get(`/reportes/asistencias?${params.toString()}`);
  return response.data;
};

export const generarReporteConceptos = async () => {
  const response = await api.get('/reportes/conceptos');
  return response.data;
};

export const generarReporteClases = async () => {
  const response = await api.get('/reportes/clases');
  return response.data;
};
