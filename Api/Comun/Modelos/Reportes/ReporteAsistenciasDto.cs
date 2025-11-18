namespace Api.Comun.Modelos.Reportes;

public class ReporteAsistenciasDto
{
    public List<AsistenciaReporteItem> Asistencias { get; set; } = new();
    public ResumenAsistencias Resumen { get; set; } = new();
    public List<AsistenciasPorClase> AsistenciasPorClase { get; set; } = new();
    public List<AsistenciasPorDia> AsistenciasPorDia { get; set; } = new();
    public List<AsistenciaPorAlumno> TopAlumnos { get; set; } = new();
}

public class AsistenciaReporteItem
{
    public int Id { get; set; }
    public string AlumnoNombre { get; set; } = string.Empty;
    public string ClaseNombre { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public bool Presente { get; set; }
    public string? Observaciones { get; set; }
}

public class ResumenAsistencias
{
    public int TotalAsistencias { get; set; }
    public int TotalPresentes { get; set; }
    public int TotalAusentes { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
    public int PromedioAsistenciasPorDia { get; set; }
}

public class AsistenciasPorClase
{
    public string Clase { get; set; } = string.Empty;
    public int TotalAsistencias { get; set; }
    public int Presentes { get; set; }
    public int Ausentes { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
}

public class AsistenciasPorDia
{
    public DateTime Fecha { get; set; }
    public int TotalAsistencias { get; set; }
    public int Presentes { get; set; }
    public int Ausentes { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
}

public class AsistenciaPorAlumno
{
    public string AlumnoNombre { get; set; } = string.Empty;
    public int TotalAsistencias { get; set; }
    public int Presentes { get; set; }
    public decimal PorcentajeAsistencia { get; set; }
}
