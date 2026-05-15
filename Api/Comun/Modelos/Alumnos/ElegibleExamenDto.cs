namespace Api.Comun.Modelos.Alumnos;

/// <summary>
/// Datos de un alumno elegible para presentar examen de cinta,
/// incluyendo su porcentaje de asistencia calculado.
/// </summary>
public class ElegibleExamenDto
{
    public string Slug { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? CintaActualNombre { get; set; }
    public string? CintaActualColorHex { get; set; }
    public string? ClaseNombre { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
    public int TotalPresencias { get; set; }
    public int TotalRegistros { get; set; }
}
