namespace Api.Comun.Modelos.Reportes;

public class ReporteEstudiantesDto
{
    public List<EstudianteReporteItem> Estudiantes { get; set; } = new();
    public ResumenEstudiantes Resumen { get; set; } = new();
    public List<EstudiantesPorCinta> EstudiantesPorCinta { get; set; } = new();
    public List<EstudiantesPorClase> EstudiantesPorClase { get; set; } = new();
    public List<DistribucionEdades> DistribucionPorEdad { get; set; } = new();
}

public class EstudianteReporteItem
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public int Edad { get; set; }
    public string? Cinta { get; set; }
    public List<string> Clases { get; set; } = new();
    public DateTime FechaInscripcion { get; set; }
    public bool Activo { get; set; }
    public string? EmailTutor { get; set; }
    public string TelefonoTutor { get; set; } = string.Empty;
}

public class ResumenEstudiantes
{
    public int TotalEstudiantes { get; set; }
    public int EstudiantesActivos { get; set; }
    public int EstudiantesInactivos { get; set; }
    public int EdadPromedio { get; set; }
    public int EdadMinima { get; set; }
    public int EdadMaxima { get; set; }
}

public class EstudiantesPorCinta
{
    public string Cinta { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal Porcentaje { get; set; }
}

public class EstudiantesPorClase
{
    public string Clase { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal Porcentaje { get; set; }
}

public class DistribucionEdades
{
    public string RangoEdad { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal Porcentaje { get; set; }
}
