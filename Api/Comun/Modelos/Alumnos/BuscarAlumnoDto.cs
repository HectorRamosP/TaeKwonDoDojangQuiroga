namespace Api.Comun.Modelos.Alumnos;

public class BuscarAlumnoDto
{
    public int Id { get; set; }

    // Datos básicos
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Curp { get; set; } = string.Empty;
    public string Enfermedades { get; set; } = "No";
    public DateTime FechaNacimiento { get; set; }
    public int Edad { get; set; }
    public string? Direccion { get; set; }
    public string? Sexo { get; set; }

    // Datos del Tutor
    public string NombreTutor { get; set; } = string.Empty;
    public string TelefonoTutor { get; set; } = string.Empty;
    public string EmailTutor { get; set; } = string.Empty;

    // Cinta actual
    public int? CintaActualId { get; set; }
    public string? CintaActualNombre { get; set; }
    public string? CintaActualColor { get; set; }
    public int? CintaActualOrden { get; set; }

    // Horario/Clase al que asiste
    public int? ClaseId { get; set; }
    public string? ClaseNombre { get; set; }
    public string? ClaseHorario { get; set; }

    // Mensualidad contratada
    public int? ConceptoMensualidadId { get; set; }
    public string? ConceptoMensualidadNombre { get; set; }
    public decimal? ConceptoMensualidadMonto { get; set; }

    public bool Activo { get; set; }
    public DateTime FechaInscripcion { get; set; }
    public string Slug { get; set; } = string.Empty;
}
