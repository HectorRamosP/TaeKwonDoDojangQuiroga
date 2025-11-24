using System.ComponentModel.DataAnnotations;

namespace Api.Comun.Modelos.Conceptos;

public class CrearConceptoDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de concepto es requerido")]
    [MaxLength(50)]
    public string TipoConcepto { get; set; } = string.Empty; // Mensualidad, Examen, Inscripcion, Uniforme, Otro

    [Required(ErrorMessage = "El precio es requerido")]
    [Range(0, double.MaxValue, ErrorMessage = "El precio debe ser mayor o igual a 0")]
    public decimal Precio { get; set; }

    public string? Descripcion { get; set; }
}
