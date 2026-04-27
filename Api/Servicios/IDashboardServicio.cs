using Api.Comun.Modelos.Dashboard;

namespace Api.Servicios;

public interface IDashboardServicio
{
    Task<DashboardDto> ObtenerDashboardAsync();
}
