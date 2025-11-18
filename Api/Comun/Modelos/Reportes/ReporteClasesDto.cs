namespace Api.Comun.Modelos.Reportes;

public class ReporteClasesDto
{
    public List<ClaseReporteItem> Clases { get; set; } = new();
    public ResumenClases Resumen { get; set; } = new();
    public List<ClasePorAsistencia> ClasesPorAsistencia { get; set; } = new();
    public List<ClasePorCapacidad> ClasesPorCapacidad { get; set; } = new();
}

public class ClaseReporteItem
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Horario { get; set; } = string.Empty;
    public string DiaSemana { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
    public int AlumnosInscritos { get; set; }
    public decimal PorcentajeOcupacion { get; set; }
    public int PromedioAsistencia { get; set; }
    public bool Activa { get; set; }
}

public class ResumenClases
{
    public int TotalClases { get; set; }
    public int ClasesActivas { get; set; }
    public int ClasesInactivas { get; set; }
    public int TotalAlumnosInscritos { get; set; }
    public decimal PromedioAlumnosPorClase { get; set; }
    public decimal PorcentajeOcupacionPromedio { get; set; }
}

public class ClasePorAsistencia
{
    public string Clase { get; set; } = string.Empty;
    public int PromedioAsistencia { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
}

public class ClasePorCapacidad
{
    public string Clase { get; set; } = string.Empty;
    public int CapacidadMaxima { get; set; }
    public int AlumnosInscritos { get; set; }
    public decimal PorcentajeOcupacion { get; set; }
}
