namespace Api.Comun.Modelos.Dashboard;

public class DashboardDto
{
    public int TotalAlumnosActivos { get; set; }
    public decimal IngresosMes { get; set; }
    public double PorcentajeAsistenciaDia { get; set; }
    public int TotalAsistenciaDia { get; set; }
    public int TotalEsperadosDia { get; set; }
    public List<ClaseDashboardItem> ClasesHoy { get; set; } = new();
    public List<AlumnosMesItem> NuevosAlumnosPorMes { get; set; } = new();
}

public class ClaseDashboardItem
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFin { get; set; } = string.Empty;
    public int Inscritos { get; set; }
    public string TipoClase { get; set; } = string.Empty;
    public string Dias { get; set; } = string.Empty;
}

public class AlumnosMesItem
{
    public string Mes { get; set; } = string.Empty;
    public int Anio { get; set; }
    public int NumMes { get; set; }
    public int Nuevos { get; set; }
}
