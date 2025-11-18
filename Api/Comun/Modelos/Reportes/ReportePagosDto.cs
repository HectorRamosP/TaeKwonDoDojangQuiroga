namespace Api.Comun.Modelos.Reportes;

public class ReportePagosDto
{
    public List<PagoReporteItem> Pagos { get; set; } = new();
    public ResumenPagos Resumen { get; set; } = new();
    public List<PagosPorMetodo> PagosPorMetodoPago { get; set; } = new();
    public List<PagosPorEstado> PagosPorEstado { get; set; } = new();
    public List<PagosPorConcepto> PagosPorConcepto { get; set; } = new();
}

public class PagoReporteItem
{
    public int Id { get; set; }
    public string AlumnoNombre { get; set; } = string.Empty;
    public string ConceptoNombre { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateTime Fecha { get; set; }
    public string MetodoPago { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string? Referencia { get; set; }
    public string? Notas { get; set; }
}

public class ResumenPagos
{
    public int TotalPagos { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal MontoConfirmado { get; set; }
    public decimal MontoPendiente { get; set; }
    public decimal MontoRechazado { get; set; }
    public decimal PromedioMonto { get; set; }
}

public class PagosPorMetodo
{
    public string MetodoPago { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal Porcentaje { get; set; }
}

public class PagosPorEstado
{
    public string Estado { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal Porcentaje { get; set; }
}

public class PagosPorConcepto
{
    public string Concepto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal MontoTotal { get; set; }
    public decimal Porcentaje { get; set; }
}
