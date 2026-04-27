namespace Api.Comun.Modelos.Asistencias;

public class BuscarAsistenciaDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public bool Presente { get; set; }
    public bool Justificada { get; set; }
    public string? Observacion { get; set; }
    public int AlumnoId { get; set; }
    public string AlumnoNombre { get; set; } = string.Empty;
    public int ClaseId { get; set; }
    public string ClaseNombre { get; set; } = string.Empty;
    public int UsuarioRegistroId { get; set; }
    public string UsuarioRegistroNombre { get; set; } = string.Empty;
}
