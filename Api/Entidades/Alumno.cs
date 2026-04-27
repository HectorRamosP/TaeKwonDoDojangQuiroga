using Api.Comun.Interfaces;

namespace Api.Entidades;

public class Alumno : ISlug
{
    public int Id { get; set; }

    // Datos básicos del alumno (menor de edad)
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public string? Curp { get; set; }
    public string Enfermedades { get; set; } = "No";
    public DateTime FechaNacimiento { get; set; }
    public string? Direccion { get; set; }
    public string? Sexo { get; set; } // Masculino, Femenino

    // Datos del Tutor (requeridos ya que son menores de edad)
    public string NombreTutor { get; set; } = string.Empty;
    public string TelefonoTutor { get; set; } = string.Empty;
    public string EmailTutor { get; set; } = string.Empty;

    // Cinta actual
    public int? CintaActualId { get; set; }
    public virtual Cinta? CintaActual { get; set; }

    // Horario/Clase al que asiste
    public int? ClaseId { get; set; }
    public virtual Clase? Clase { get; set; }

    // Mensualidad contratada
    public int? ConceptoMensualidadId { get; set; }
    public virtual Concepto? ConceptoMensualidad { get; set; }

    public bool Activo { get; set; } = true;
    public DateTime FechaInscripcion { get; set; } = DateTime.Now;
    public string Slug { get; set; } = string.Empty;

    // Relaciones
    public virtual ICollection<AlumnoInscripcion> AlumnoInscripciones { get; set; } = new List<AlumnoInscripcion>();
    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    public virtual ICollection<Asistencia> Asistencias { get; set; } = new List<Asistencia>();
    public virtual ICollection<HistorialCinta> HistorialCintas { get; set; } = new List<HistorialCinta>();

    // Propiedad calculada para obtener la edad
    public int ObtenerEdad()
    {
        var hoy = DateTime.Today;
        var edad = hoy.Year - FechaNacimiento.Year;
        if (FechaNacimiento.Date > hoy.AddYears(-edad)) edad--;
        return edad;
    }

    public string ObtenerDescripcionParaSlug() => $"{Nombre}-{ApellidoPaterno}";
}
