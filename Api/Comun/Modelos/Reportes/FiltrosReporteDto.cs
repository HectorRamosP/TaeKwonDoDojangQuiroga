namespace Api.Comun.Modelos.Reportes;

public class FiltrosReporteDto
{
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public int? AlumnoId { get; set; }
    public int? ClaseId { get; set; }
    public int? ConceptoId { get; set; }
    public int? CintaId { get; set; }
    public string? Estado { get; set; }
    public string? MetodoPago { get; set; }
}
