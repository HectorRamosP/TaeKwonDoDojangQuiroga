using Api.Comun.Modelos.Asistencias;
using Api.Comun.Modelos.Pagos;

namespace Api.Comun.Modelos.Alumnos;

public class PerfilAlumnoDto
{
    // Datos del alumno
    public BuscarAlumnoDto Alumno { get; set; } = null!;

    // Resumen de asistencias
    public int TotalPresencias { get; set; }
    public int TotalFaltas { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
    public int TotalJustificadas { get; set; }

    // Detalle de asistencias
    public List<BuscarAsistenciaDto> Asistencias { get; set; } = new();

    // Historial de cintas
    public List<HistorialCintaDto> HistorialCintas { get; set; } = new();

    // Historial de pagos
    public List<PagoPerfilDto> HistorialPagos { get; set; } = new();
}

public class HistorialCintaDto
{
    public int Id { get; set; }
    public DateTime FechaObtencion { get; set; }
    public string? Observaciones { get; set; }
    public int CintaId { get; set; }
    public string CintaNombre { get; set; } = string.Empty;
    public string CintaColorHex { get; set; } = string.Empty;
    public int CintaOrden { get; set; }
}
