using Api.Comun.Interfaces;

namespace Api.Entidades;

public class Concepto : ISlug
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string TipoConcepto { get; set; } = string.Empty; // Mensualidad, Examen, Inscripcion, Uniforme, Otro
    public decimal Precio { get; set; }
    public string? Descripcion { get; set; }
    public bool Activo { get; set; } = true;
    public string Slug { get; set; } = string.Empty;

    // Relaciones
    public virtual ICollection<AlumnoInscripcion> AlumnoInscripciones { get; set; } = new List<AlumnoInscripcion>();
    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public string ObtenerDescripcionParaSlug() => Nombre;
}
