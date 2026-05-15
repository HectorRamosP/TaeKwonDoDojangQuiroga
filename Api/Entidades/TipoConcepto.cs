namespace Api.Entidades;

public class TipoConcepto
{
    public int Id { get; set; }

    /// <summary>Nombre único del tipo (ej: "Mensualidad", "Examen").</summary>
    public string Nombre { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    /// <summary>Orden de aparición en dropdowns (ascendente).</summary>
    public int Orden { get; set; }

    public bool Activo { get; set; } = true;
}
