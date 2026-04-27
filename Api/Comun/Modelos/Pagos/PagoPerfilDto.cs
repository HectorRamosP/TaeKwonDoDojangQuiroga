namespace Api.Comun.Modelos.Pagos;

/// <summary>
/// DTO simplificado de pago para mostrar en el perfil del alumno.
/// No incluye datos del alumno (ya están en el contexto del perfil).
/// </summary>
public class PagoPerfilDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string ConceptoNombre { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string? Referencia { get; set; }
    public string? Notas { get; set; }
}
