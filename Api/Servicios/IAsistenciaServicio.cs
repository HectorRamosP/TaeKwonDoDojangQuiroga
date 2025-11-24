using Api.Comun.Modelos.Asistencias;

namespace Api.Servicios;

public interface IAsistenciaServicio
{
    Task<List<BuscarAsistenciaDto>> ObtenerAsistencias(int? claseId = null, int? alumnoId = null, DateTime? fecha = null);
    Task<BuscarAsistenciaDto?> ObtenerAsistenciaPorId(int id);
    Task<BuscarAsistenciaDto> RegistrarAsistencia(RegistrarAsistenciaDto dto, int usuarioId);
    Task RegistrarAsistenciasMasivas(RegistrarAsistenciasMasivasDto dto, int usuarioId);
    Task<int> ContarFaltasPorAlumnoYRango(int alumnoId, DateTime fechaInicio, DateTime fechaFin);
    Task EliminarAsistenciasPorClaseYFecha(int claseId, DateTime fecha);
}
