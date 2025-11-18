namespace Api.Comun.Modelos.Reportes;

public class ReporteConceptosDto
{
    public List<ConceptoReporteItem> Conceptos { get; set; } = new();
    public ResumenConceptos Resumen { get; set; } = new();
    public List<ConceptoPopularidad> ConceptosMasVendidos { get; set; } = new();
    public List<ConceptoIngreso> ConceptosPorIngreso { get; set; } = new();
}

public class ConceptoReporteItem
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Costo { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public int VecesVendido { get; set; }
    public decimal IngresoTotal { get; set; }
    public bool Activo { get; set; }
}

public class ResumenConceptos
{
    public int TotalConceptos { get; set; }
    public int ConceptosActivos { get; set; }
    public int ConceptosInactivos { get; set; }
    public decimal CostoPromedio { get; set; }
    public int TotalVentas { get; set; }
    public decimal IngresoTotal { get; set; }
}

public class ConceptoPopularidad
{
    public string Concepto { get; set; } = string.Empty;
    public int CantidadVentas { get; set; }
    public decimal Porcentaje { get; set; }
}

public class ConceptoIngreso
{
    public string Concepto { get; set; } = string.Empty;
    public decimal IngresoTotal { get; set; }
    public decimal Porcentaje { get; set; }
}
