using System.Text.Json.Serialization;

namespace Api.Entidades;

public class HistorialCinta
{
    public int Id { get; set; }
    public DateTime FechaObtencion { get; set; }
    public string? Observaciones { get; set; }

    public int AlumnoId { get; set; }
    [JsonIgnore]
    public virtual Alumno Alumno { get; set; } = null!;

    public int CintaId { get; set; }
    [JsonIgnore]
    public virtual Cinta Cinta { get; set; } = null!;
}
