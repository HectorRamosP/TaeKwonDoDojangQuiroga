namespace Api.Comun.Modelos.Conceptos;

public class BuscarConceptoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string TipoConcepto { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
    public string Slug { get; set; } = string.Empty;
}
