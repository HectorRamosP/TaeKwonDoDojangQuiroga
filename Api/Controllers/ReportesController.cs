using Api.Comun.Modelos.Reportes;
using Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("reportes")]
[Route("v1/reportes")]
public class ReportesController : ControllerBase
{
    private readonly IReporteServicio _reporteServicio;

    public ReportesController(IReporteServicio reporteServicio)
    {
        _reporteServicio = reporteServicio;
    }

    /// <summary>
    /// Genera un reporte completo de pagos con estadísticas y análisis
    /// </summary>
    [HttpGet("pagos")]
    public async Task<ActionResult<ReportePagosDto>> GenerarReportePagos(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? alumnoId = null,
        [FromQuery] int? conceptoId = null,
        [FromQuery] string? estado = null,
        [FromQuery] string? metodoPago = null)
    {
        var filtros = new FiltrosReporteDto
        {
            FechaInicio = fechaInicio,
            FechaFin = fechaFin,
            AlumnoId = alumnoId,
            ConceptoId = conceptoId,
            Estado = estado,
            MetodoPago = metodoPago
        };

        var reporte = await _reporteServicio.GenerarReportePagosAsync(filtros);
        return Ok(reporte);
    }

    /// <summary>
    /// Genera un reporte completo de estudiantes con estadísticas demográficas
    /// </summary>
    [HttpGet("estudiantes")]
    public async Task<ActionResult<ReporteEstudiantesDto>> GenerarReporteEstudiantes(
        [FromQuery] int? cintaId = null,
        [FromQuery] int? claseId = null)
    {
        var filtros = new FiltrosReporteDto
        {
            CintaId = cintaId,
            ClaseId = claseId
        };

        var reporte = await _reporteServicio.GenerarReporteEstudiantesAsync(filtros);
        return Ok(reporte);
    }

    /// <summary>
    /// Genera un reporte completo de asistencias con análisis de tendencias
    /// </summary>
    [HttpGet("asistencias")]
    public async Task<ActionResult<ReporteAsistenciasDto>> GenerarReporteAsistencias(
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null,
        [FromQuery] int? alumnoId = null,
        [FromQuery] int? claseId = null)
    {
        var filtros = new FiltrosReporteDto
        {
            FechaInicio = fechaInicio,
            FechaFin = fechaFin,
            AlumnoId = alumnoId,
            ClaseId = claseId
        };

        var reporte = await _reporteServicio.GenerarReporteAsistenciasAsync(filtros);
        return Ok(reporte);
    }

    /// <summary>
    /// Genera un reporte completo de conceptos con análisis de ventas e ingresos
    /// </summary>
    [HttpGet("conceptos")]
    public async Task<ActionResult<ReporteConceptosDto>> GenerarReporteConceptos()
    {
        var filtros = new FiltrosReporteDto();
        var reporte = await _reporteServicio.GenerarReporteConceptosAsync(filtros);
        return Ok(reporte);
    }

    /// <summary>
    /// Genera un reporte completo de clases con análisis de capacidad y asistencia
    /// </summary>
    [HttpGet("clases")]
    public async Task<ActionResult<ReporteClasesDto>> GenerarReporteClases()
    {
        var filtros = new FiltrosReporteDto();
        var reporte = await _reporteServicio.GenerarReporteClasesAsync(filtros);
        return Ok(reporte);
    }
}
