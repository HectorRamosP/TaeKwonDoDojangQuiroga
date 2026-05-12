namespace Api.Comun.Modelos;

/// <summary>
/// Configuración del examen de cinta, leída desde appsettings.json.
/// </summary>
public class ExamenAjuste
{
    /// <summary>
    /// Porcentaje mínimo de asistencia (0-100) que debe tener un alumno
    /// para ser considerado elegible para presentar examen de cinta.
    /// Valor por defecto: 70.
    /// </summary>
    public decimal PorcentajeMinAsistencia { get; init; } = 70m;
}
