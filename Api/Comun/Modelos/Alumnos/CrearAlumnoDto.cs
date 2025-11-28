using System.ComponentModel.DataAnnotations;

namespace Api.Comun.Modelos.Alumnos;

public class CrearAlumnoDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido paterno es requerido")]
    [MaxLength(100)]
    public string ApellidoPaterno { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido materno es requerido")]
    [MaxLength(100)]
    public string ApellidoMaterno { get; set; } = string.Empty;

    [StringLength(18, MinimumLength = 18, ErrorMessage = "El CURP debe tener exactamente 18 caracteres")]
    [RegularExpression(@"^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$", ErrorMessage = "Formato de CURP inválido")]
    public string? Curp { get; set; }

    [Required(ErrorMessage = "El campo de enfermedades es requerido")]
    [MaxLength(500)]
    public string Enfermedades { get; set; } = "No";

    [Required(ErrorMessage = "La fecha de nacimiento es requerida")]
    public DateTime FechaNacimiento { get; set; }

    public string? Direccion { get; set; }
    public string? Sexo { get; set; }

    // Datos del Tutor
    [Required(ErrorMessage = "El nombre del tutor es requerido")]
    [MaxLength(200)]
    public string NombreTutor { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono del tutor es requerido")]
    [MaxLength(20)]
    public string TelefonoTutor { get; set; } = string.Empty;

    [Required(ErrorMessage = "El email del tutor es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    [MaxLength(150)]
    public string EmailTutor { get; set; } = string.Empty;

    // Referencias opcionales
    public int? CintaActualId { get; set; }
    public int? ClaseId { get; set; }
    public int? ConceptoMensualidadId { get; set; }
}
