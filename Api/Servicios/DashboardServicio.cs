using Api.Comun.Modelos.Dashboard;
using Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace Api.Servicios;

public class DashboardServicio : IDashboardServicio
{
    private readonly AplicacionBdContexto _contexto;

    private static readonly Dictionary<DayOfWeek, string[]> _diasEspanol = new()
    {
        { DayOfWeek.Monday,    ["lunes"] },
        { DayOfWeek.Tuesday,   ["martes"] },
        { DayOfWeek.Wednesday, ["miércoles", "miercoles"] },
        { DayOfWeek.Thursday,  ["jueves"] },
        { DayOfWeek.Friday,    ["viernes"] },
        { DayOfWeek.Saturday,  ["sábado", "sabado"] },
        { DayOfWeek.Sunday,    ["domingo"] },
    };

    public DashboardServicio(AplicacionBdContexto contexto)
    {
        _contexto = contexto;
    }

    public async Task<DashboardDto> ObtenerDashboardAsync()
    {
        var hoy = DateTime.Today;
        var mesActual = hoy.Month;
        var anioActual = hoy.Year;

        // 1. Total alumnos activos
        var totalActivos = await _contexto.Alumnos
            .CountAsync(a => a.Activo);

        // 2. Ingresos del mes (solo pagos confirmados)
        var ingresosMes = await _contexto.Pagos
            .Where(p => p.Estado == "Confirmado"
                     && p.Fecha.Month == mesActual
                     && p.Fecha.Year == anioActual)
            .SumAsync(p => (decimal?)p.Monto) ?? 0m;

        // 3. Clases de hoy
        var nombresDiaHoy = _diasEspanol[hoy.DayOfWeek];
        var todasClases = await _contexto.Clases
            .Include(c => c.Alumnos)
            .Where(c => c.Activo)
            .ToListAsync();

        var clasesHoy = todasClases
            .Where(c => nombresDiaHoy.Any(d =>
                c.Dias.ToLower().Split(',').Select(x => x.Trim()).Contains(d)))
            .Select(c => new ClaseDashboardItem
            {
                Id = c.Id,
                Nombre = c.Nombre,
                HoraInicio = c.HoraInicio.ToString(@"hh\:mm"),
                HoraFin = c.HoraFin.ToString(@"hh\:mm"),
                Inscritos = c.Alumnos.Count(a => a.Activo),
                TipoClase = c.TipoClase,
                Dias = c.Dias
            })
            .OrderBy(c => c.HoraInicio)
            .ToList();

        // 4. Porcentaje de asistencia del día
        var idsClasesHoy = clasesHoy.Select(c => c.Id).ToList();
        var totalEsperados = clasesHoy.Sum(c => c.Inscritos);

        var totalPresentes = totalEsperados > 0
            ? await _contexto.Asistencias
                .CountAsync(a => a.Fecha == hoy
                              && a.Presente
                              && idsClasesHoy.Contains(a.ClaseId))
            : 0;

        var porcentajeAsistencia = totalEsperados > 0
            ? Math.Round((double)totalPresentes / totalEsperados * 100, 1)
            : 0.0;

        // 5. Nuevos alumnos por mes (últimos 6 meses)
        var hace6Meses = new DateTime(anioActual, mesActual, 1).AddMonths(-5);
        var cultura = new System.Globalization.CultureInfo("es-MX");

        var nuevosPorMes = await _contexto.Alumnos
            .Where(a => a.FechaInscripcion >= hace6Meses)
            .GroupBy(a => new { a.FechaInscripcion.Year, a.FechaInscripcion.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Nuevos = g.Count() })
            .ToListAsync();

        // Rellenar los meses sin inscripciones con cero
        var mesesCompletos = Enumerable.Range(0, 6)
            .Select(i => hace6Meses.AddMonths(i))
            .Select(fecha => new AlumnosMesItem
            {
                Mes = cultura.DateTimeFormat.GetMonthName(fecha.Month) + " " + fecha.Year,
                Anio = fecha.Year,
                NumMes = fecha.Month,
                Nuevos = nuevosPorMes
                    .FirstOrDefault(x => x.Year == fecha.Year && x.Month == fecha.Month)
                    ?.Nuevos ?? 0
            })
            .ToList();

        return new DashboardDto
        {
            TotalAlumnosActivos = totalActivos,
            IngresosMes = ingresosMes,
            PorcentajeAsistenciaDia = porcentajeAsistencia,
            TotalAsistenciaDia = totalPresentes,
            TotalEsperadosDia = totalEsperados,
            ClasesHoy = clasesHoy,
            NuevosAlumnosPorMes = mesesCompletos
        };
    }
}
