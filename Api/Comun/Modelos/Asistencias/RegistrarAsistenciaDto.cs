using System.ComponentModel.DataAnnotations;

namespace Api.Comun.Modelos.Asistencias;

public class RegistrarAsistenciaDto
{
    [Required]
    public int AlumnoId { get; set; }

    [Required]
    public int ClaseId { get; set; }

    [Required]
    public DateTime Fecha { get; set; }

    [Required]
    public bool Presente { get; set; }

    public bool Justificada { get; set; } = false;

    [MaxLength(500)]
    public string? Observacion { get; set; }
}
