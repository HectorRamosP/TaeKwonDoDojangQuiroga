using Api.Comun.Modelos.Reportes;

namespace Api.Servicios;

public interface IReporteServicio
{
    Task<ReportePagosDto> GenerarReportePagosAsync(FiltrosReporteDto filtros);
    Task<ReporteEstudiantesDto> GenerarReporteEstudiantesAsync(FiltrosReporteDto filtros);
    Task<ReporteAsistenciasDto> GenerarReporteAsistenciasAsync(FiltrosReporteDto filtros);
    Task<ReporteConceptosDto> GenerarReporteConceptosAsync(FiltrosReporteDto filtros);
    Task<ReporteClasesDto> GenerarReporteClasesAsync(FiltrosReporteDto filtros);
}
