using Api.Comun.Modelos.Reportes;
using Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace Api.Servicios;

public class ReporteServicio : IReporteServicio
{
    private readonly AplicacionBdContexto _contexto;

    public ReporteServicio(AplicacionBdContexto contexto)
    {
        _contexto = contexto;
    }

    public async Task<ReportePagosDto> GenerarReportePagosAsync(FiltrosReporteDto filtros)
    {
        var query = _contexto.Pagos
            .Include(p => p.Alumno)
            .Include(p => p.Concepto)
            .AsQueryable();

        // Aplicar filtros
        if (filtros.FechaInicio.HasValue)
            query = query.Where(p => p.Fecha >= filtros.FechaInicio.Value);

        if (filtros.FechaFin.HasValue)
            query = query.Where(p => p.Fecha <= filtros.FechaFin.Value);

        if (filtros.AlumnoId.HasValue)
            query = query.Where(p => p.AlumnoId == filtros.AlumnoId.Value);

        if (filtros.ConceptoId.HasValue)
            query = query.Where(p => p.ConceptoId == filtros.ConceptoId.Value);

        if (!string.IsNullOrEmpty(filtros.Estado))
            query = query.Where(p => p.Estado == filtros.Estado);

        if (!string.IsNullOrEmpty(filtros.MetodoPago))
            query = query.Where(p => p.MetodoPago == filtros.MetodoPago);

        var pagos = await query.ToListAsync();

        var pagoItems = pagos.Select(p => new PagoReporteItem
        {
            Id = p.Id,
            AlumnoNombre = $"{p.Alumno.Nombre} {p.Alumno.ApellidoPaterno} {p.Alumno.ApellidoMaterno}",
            ConceptoNombre = p.Concepto.Nombre,
            Monto = p.Monto,
            Fecha = p.Fecha,
            MetodoPago = p.MetodoPago,
            Estado = p.Estado,
            Referencia = p.Referencia,
            Notas = p.Notas
        }).ToList();

        var montoTotal = pagos.Sum(p => p.Monto);

        var resumen = new ResumenPagos
        {
            TotalPagos = pagos.Count,
            MontoTotal = montoTotal,
            MontoConfirmado = pagos.Where(p => p.Estado == "Confirmado").Sum(p => p.Monto),
            MontoPendiente = pagos.Where(p => p.Estado == "Pendiente").Sum(p => p.Monto),
            MontoRechazado = pagos.Where(p => p.Estado == "Rechazado").Sum(p => p.Monto),
            PromedioMonto = pagos.Any() ? pagos.Average(p => p.Monto) : 0
        };

        var pagosPorMetodo = pagos
            .GroupBy(p => p.MetodoPago)
            .Select(g => new PagosPorMetodo
            {
                MetodoPago = g.Key,
                Cantidad = g.Count(),
                MontoTotal = g.Sum(p => p.Monto),
                Porcentaje = montoTotal > 0 ? (g.Sum(p => p.Monto) / montoTotal) * 100 : 0
            }).ToList();

        var pagosPorEstado = pagos
            .GroupBy(p => p.Estado)
            .Select(g => new PagosPorEstado
            {
                Estado = g.Key,
                Cantidad = g.Count(),
                MontoTotal = g.Sum(p => p.Monto),
                Porcentaje = montoTotal > 0 ? (g.Sum(p => p.Monto) / montoTotal) * 100 : 0
            }).ToList();

        var pagosPorConcepto = pagos
            .GroupBy(p => p.Concepto.Nombre)
            .Select(g => new PagosPorConcepto
            {
                Concepto = g.Key,
                Cantidad = g.Count(),
                MontoTotal = g.Sum(p => p.Monto),
                Porcentaje = montoTotal > 0 ? (g.Sum(p => p.Monto) / montoTotal) * 100 : 0
            })
            .OrderByDescending(p => p.MontoTotal)
            .ToList();

        return new ReportePagosDto
        {
            Pagos = pagoItems,
            Resumen = resumen,
            PagosPorMetodoPago = pagosPorMetodo,
            PagosPorEstado = pagosPorEstado,
            PagosPorConcepto = pagosPorConcepto
        };
    }

    public async Task<ReporteEstudiantesDto> GenerarReporteEstudiantesAsync(FiltrosReporteDto filtros)
    {
        var query = _contexto.Alumnos
            .Include(a => a.CintaActual)
            .Include(a => a.AlumnoInscripciones)
                .ThenInclude(i => i.Concepto)
            .Include(a => a.Clase)
            .AsQueryable();

        // Aplicar filtros
        if (filtros.CintaId.HasValue)
            query = query.Where(a => a.CintaActualId == filtros.CintaId.Value);

        if (filtros.ClaseId.HasValue)
            query = query.Where(a => a.ClaseId == filtros.ClaseId.Value);

        var alumnos = await query.ToListAsync();

        var estudianteItems = alumnos.Select(a => new EstudianteReporteItem
        {
            Id = a.Id,
            Nombre = a.Nombre,
            ApellidoPaterno = a.ApellidoPaterno,
            ApellidoMaterno = a.ApellidoMaterno,
            Edad = DateTime.Now.Year - a.FechaNacimiento.Year,
            Cinta = a.CintaActual?.Nombre,
            Clases = a.Clase != null ? new List<string> { a.Clase.Nombre } : new List<string>(),
            FechaInscripcion = a.FechaInscripcion,
            Activo = a.Activo,
            EmailTutor = a.EmailTutor,
            TelefonoTutor = a.TelefonoTutor
        }).ToList();

        var edades = estudianteItems.Select(e => e.Edad).ToList();

        var resumen = new ResumenEstudiantes
        {
            TotalEstudiantes = alumnos.Count,
            EstudiantesActivos = alumnos.Count(a => a.Activo),
            EstudiantesInactivos = alumnos.Count(a => !a.Activo),
            EdadPromedio = edades.Any() ? (int)edades.Average() : 0,
            EdadMinima = edades.Any() ? edades.Min() : 0,
            EdadMaxima = edades.Any() ? edades.Max() : 0
        };

        var estudiantesPorCinta = alumnos
            .GroupBy(a => a.CintaActual != null ? a.CintaActual.Nombre : "Sin Cinta")
            .Select(g => new EstudiantesPorCinta
            {
                Cinta = g.Key,
                Cantidad = g.Count(),
                Porcentaje = alumnos.Count > 0 ? ((decimal)g.Count() / alumnos.Count) * 100 : 0
            })
            .OrderByDescending(e => e.Cantidad)
            .ToList();

        var estudiantesPorClase = alumnos
            .Where(a => a.Clase != null)
            .GroupBy(a => a.Clase!.Nombre)
            .Select(g => new EstudiantesPorClase
            {
                Clase = g.Key,
                Cantidad = g.Count(),
                Porcentaje = alumnos.Count > 0 ? ((decimal)g.Count() / alumnos.Count) * 100 : 0
            })
            .OrderByDescending(e => e.Cantidad)
            .ToList();

        var distribucionPorEdad = estudianteItems
            .GroupBy(e =>
            {
                if (e.Edad < 6) return "0-5 años";
                if (e.Edad < 12) return "6-11 años";
                if (e.Edad < 18) return "12-17 años";
                if (e.Edad < 30) return "18-29 años";
                if (e.Edad < 50) return "30-49 años";
                return "50+ años";
            })
            .Select(g => new DistribucionEdades
            {
                RangoEdad = g.Key,
                Cantidad = g.Count(),
                Porcentaje = estudianteItems.Count > 0 ? ((decimal)g.Count() / estudianteItems.Count) * 100 : 0
            })
            .OrderBy(d => d.RangoEdad)
            .ToList();

        return new ReporteEstudiantesDto
        {
            Estudiantes = estudianteItems,
            Resumen = resumen,
            EstudiantesPorCinta = estudiantesPorCinta,
            EstudiantesPorClase = estudiantesPorClase,
            DistribucionPorEdad = distribucionPorEdad
        };
    }

    public async Task<ReporteAsistenciasDto> GenerarReporteAsistenciasAsync(FiltrosReporteDto filtros)
    {
        var query = _contexto.Asistencias
            .Include(a => a.Alumno)
            .Include(a => a.Clase)
            .AsQueryable();

        // Aplicar filtros
        if (filtros.FechaInicio.HasValue)
            query = query.Where(a => a.Fecha >= filtros.FechaInicio.Value);

        if (filtros.FechaFin.HasValue)
            query = query.Where(a => a.Fecha <= filtros.FechaFin.Value);

        if (filtros.AlumnoId.HasValue)
            query = query.Where(a => a.AlumnoId == filtros.AlumnoId.Value);

        if (filtros.ClaseId.HasValue)
            query = query.Where(a => a.ClaseId == filtros.ClaseId.Value);

        var asistencias = await query.ToListAsync();

        var asistenciaItems = asistencias.Select(a => new AsistenciaReporteItem
        {
            Id = a.Id,
            AlumnoNombre = $"{a.Alumno.Nombre} {a.Alumno.ApellidoPaterno} {a.Alumno.ApellidoMaterno}",
            ClaseNombre = a.Clase.Nombre,
            Fecha = a.Fecha,
            Presente = a.Presente,
            Observaciones = null
        }).ToList();

        var totalPresentes = asistencias.Count(a => a.Presente);

        var resumen = new ResumenAsistencias
        {
            TotalAsistencias = asistencias.Count,
            TotalPresentes = totalPresentes,
            TotalAusentes = asistencias.Count - totalPresentes,
            PorcentajeAsistencia = asistencias.Count > 0 ? ((decimal)totalPresentes / asistencias.Count) * 100 : 0,
            PromedioAsistenciasPorDia = asistencias.Count > 0
                ? (int)asistencias.GroupBy(a => a.Fecha.Date).Average(g => g.Count())
                : 0
        };

        var asistenciasPorClase = asistencias
            .GroupBy(a => a.Clase.Nombre)
            .Select(g => new AsistenciasPorClase
            {
                Clase = g.Key,
                TotalAsistencias = g.Count(),
                Presentes = g.Count(a => a.Presente),
                Ausentes = g.Count(a => !a.Presente),
                PorcentajeAsistencia = g.Count() > 0 ? ((decimal)g.Count(a => a.Presente) / g.Count()) * 100 : 0
            })
            .OrderByDescending(a => a.TotalAsistencias)
            .ToList();

        var asistenciasPorDia = asistencias
            .GroupBy(a => a.Fecha.Date)
            .Select(g => new AsistenciasPorDia
            {
                Fecha = g.Key,
                TotalAsistencias = g.Count(),
                Presentes = g.Count(a => a.Presente),
                Ausentes = g.Count(a => !a.Presente),
                PorcentajeAsistencia = g.Count() > 0 ? ((decimal)g.Count(a => a.Presente) / g.Count()) * 100 : 0
            })
            .OrderBy(a => a.Fecha)
            .ToList();

        var topAlumnos = asistencias
            .GroupBy(a => new { a.AlumnoId, NombreCompleto = $"{a.Alumno.Nombre} {a.Alumno.ApellidoPaterno} {a.Alumno.ApellidoMaterno}" })
            .Select(g => new AsistenciaPorAlumno
            {
                AlumnoNombre = g.Key.NombreCompleto,
                TotalAsistencias = g.Count(),
                Presentes = g.Count(a => a.Presente),
                PorcentajeAsistencia = g.Count() > 0 ? ((decimal)g.Count(a => a.Presente) / g.Count()) * 100 : 0
            })
            .OrderByDescending(a => a.Presentes)
            .Take(10)
            .ToList();

        return new ReporteAsistenciasDto
        {
            Asistencias = asistenciaItems,
            Resumen = resumen,
            AsistenciasPorClase = asistenciasPorClase,
            AsistenciasPorDia = asistenciasPorDia,
            TopAlumnos = topAlumnos
        };
    }

    public async Task<ReporteConceptosDto> GenerarReporteConceptosAsync(FiltrosReporteDto filtros)
    {
        var query = _contexto.Conceptos
            .Include(c => c.Pagos)
            .AsQueryable();

        var conceptos = await query.ToListAsync();

        var conceptoItems = conceptos.Select(c => new ConceptoReporteItem
        {
            Id = c.Id,
            Nombre = c.Nombre,
            Costo = c.Precio,
            Tipo = c.TipoConcepto,
            VecesVendido = c.Pagos.Count,
            IngresoTotal = c.Pagos.Sum(p => p.Monto),
            Activo = c.Activo
        }).ToList();

        var totalVentas = conceptoItems.Sum(c => c.VecesVendido);
        var ingresoTotal = conceptoItems.Sum(c => c.IngresoTotal);

        var resumen = new ResumenConceptos
        {
            TotalConceptos = conceptos.Count,
            ConceptosActivos = conceptos.Count(c => c.Activo),
            ConceptosInactivos = conceptos.Count(c => !c.Activo),
            CostoPromedio = conceptos.Any() ? conceptos.Average(c => c.Precio) : 0,
            TotalVentas = totalVentas,
            IngresoTotal = ingresoTotal
        };

        var conceptosMasVendidos = conceptoItems
            .OrderByDescending(c => c.VecesVendido)
            .Take(10)
            .Select(c => new ConceptoPopularidad
            {
                Concepto = c.Nombre,
                CantidadVentas = c.VecesVendido,
                Porcentaje = totalVentas > 0 ? ((decimal)c.VecesVendido / totalVentas) * 100 : 0
            })
            .ToList();

        var conceptosPorIngreso = conceptoItems
            .OrderByDescending(c => c.IngresoTotal)
            .Take(10)
            .Select(c => new ConceptoIngreso
            {
                Concepto = c.Nombre,
                IngresoTotal = c.IngresoTotal,
                Porcentaje = ingresoTotal > 0 ? (c.IngresoTotal / ingresoTotal) * 100 : 0
            })
            .ToList();

        return new ReporteConceptosDto
        {
            Conceptos = conceptoItems,
            Resumen = resumen,
            ConceptosMasVendidos = conceptosMasVendidos,
            ConceptosPorIngreso = conceptosPorIngreso
        };
    }

    public async Task<ReporteClasesDto> GenerarReporteClasesAsync(FiltrosReporteDto filtros)
    {
        var query = _contexto.Clases
            .Include(c => c.Alumnos)
            .Include(c => c.Asistencias)
            .AsQueryable();

        var clases = await query.ToListAsync();

        var claseItems = clases.Select(c =>
        {
            var alumnosInscritos = c.Alumnos.Count();
            var asistenciasClase = c.Asistencias.ToList();
            var promedioAsistencia = asistenciasClase.Any()
                ? asistenciasClase.Count(a => a.Presente)
                : 0;

            return new ClaseReporteItem
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Horario = $"{c.HoraInicio:hh\\:mm} - {c.HoraFin:hh\\:mm}",
                DiaSemana = c.Dias,
                CapacidadMaxima = c.CupoMaximo ?? 0,
                AlumnosInscritos = alumnosInscritos,
                PorcentajeOcupacion = (c.CupoMaximo ?? 0) > 0 ? ((decimal)alumnosInscritos / (c.CupoMaximo ?? 1)) * 100 : 0,
                PromedioAsistencia = promedioAsistencia,
                Activa = c.Activo
            };
        }).ToList();

        var resumen = new ResumenClases
        {
            TotalClases = clases.Count,
            ClasesActivas = clases.Count(c => c.Activo),
            ClasesInactivas = clases.Count(c => !c.Activo),
            TotalAlumnosInscritos = claseItems.Sum(c => c.AlumnosInscritos),
            PromedioAlumnosPorClase = claseItems.Any() ? (decimal)claseItems.Average(c => c.AlumnosInscritos) : 0,
            PorcentajeOcupacionPromedio = claseItems.Any() ? claseItems.Average(c => c.PorcentajeOcupacion) : 0
        };

        var clasesPorAsistencia = claseItems
            .OrderByDescending(c => c.PromedioAsistencia)
            .Select(c => new ClasePorAsistencia
            {
                Clase = c.Nombre,
                PromedioAsistencia = c.PromedioAsistencia,
                PorcentajeAsistencia = c.AlumnosInscritos > 0 ? ((decimal)c.PromedioAsistencia / c.AlumnosInscritos) * 100 : 0
            })
            .ToList();

        var clasesPorCapacidad = claseItems
            .OrderByDescending(c => c.PorcentajeOcupacion)
            .Select(c => new ClasePorCapacidad
            {
                Clase = c.Nombre,
                CapacidadMaxima = c.CapacidadMaxima,
                AlumnosInscritos = c.AlumnosInscritos,
                PorcentajeOcupacion = c.PorcentajeOcupacion
            })
            .ToList();

        return new ReporteClasesDto
        {
            Clases = claseItems,
            Resumen = resumen,
            ClasesPorAsistencia = clasesPorAsistencia,
            ClasesPorCapacidad = clasesPorCapacidad
        };
    }
}
