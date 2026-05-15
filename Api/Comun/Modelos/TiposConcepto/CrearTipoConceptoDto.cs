using System.ComponentModel.DataAnnotations;

namespace Api.Comun.Modelos.TiposConcepto;

public class CrearTipoConceptoDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [MaxLength(50, ErrorMessage = "El nombre no puede superar 50 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(300, ErrorMessage = "La descripción no puede superar 300 caracteres")]
    public string? Descripcion { get; set; }

    [Range(0, 9999, ErrorMessage = "El orden debe ser un número entre 0 y 9999")]
    public int Orden { get; set; }
}
