using Api.Comun.Modelos.Dashboard;
using Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("dashboard")]
[Route("v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardServicio _dashboardServicio;

    public DashboardController(IDashboardServicio dashboardServicio)
    {
        _dashboardServicio = dashboardServicio;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> ObtenerDashboard()
    {
        var datos = await _dashboardServicio.ObtenerDashboardAsync();
        return Ok(datos);
    }
}
