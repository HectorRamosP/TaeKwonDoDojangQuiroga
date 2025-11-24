using Api.Comun.Modelos;
using Api.Comun.Modelos.Asistencias;
using Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("asistencias")]
[Route("v1/asistencias")]
public class AsistenciasController : ControllerBase
{
    private readonly IAsistenciaServicio _asistenciaServicio;

    public AsistenciasController(IAsistenciaServicio asistenciaServicio)
    {
        _asistenciaServicio = asistenciaServicio;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BuscarAsistenciaDto>>>> ObtenerAsistencias(
        [FromQuery] int? claseId = null,
        [FromQuery] int? alumnoId = null,
        [FromQuery] DateTime? fecha = null)
    {
        try
        {
            var asistencias = await _asistenciaServicio.ObtenerAsistencias(claseId, alumnoId, fecha);
            return Ok(new ApiResponse<List<BuscarAsistenciaDto>>
            {
                Success = true,
                Data = asistencias
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<List<BuscarAsistenciaDto>>
            {
                Success = false,
                Message = "Error al obtener las asistencias",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BuscarAsistenciaDto>>> ObtenerAsistenciaPorId(int id)
    {
        try
        {
            var asistencia = await _asistenciaServicio.ObtenerAsistenciaPorId(id);
            if (asistencia == null)
            {
                return NotFound(new ApiResponse<BuscarAsistenciaDto>
                {
                    Success = false,
                    Message = "Asistencia no encontrada"
                });
            }

            return Ok(new ApiResponse<BuscarAsistenciaDto>
            {
                Success = true,
                Data = asistencia
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<BuscarAsistenciaDto>
            {
                Success = false,
                Message = "Error al obtener la asistencia",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BuscarAsistenciaDto>>> RegistrarAsistencia([FromBody] RegistrarAsistenciaDto dto)
    {
        try
        {
            // TODO: Obtener usuario actual del contexto del usuario autenticado
            var usuarioId = 1;

            var asistencia = await _asistenciaServicio.RegistrarAsistencia(dto, usuarioId);
            return CreatedAtAction(nameof(ObtenerAsistenciaPorId), new { id = asistencia.Id }, new ApiResponse<BuscarAsistenciaDto>
            {
                Success = true,
                Data = asistencia,
                Message = "Asistencia registrada exitosamente"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<BuscarAsistenciaDto>
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ApiResponse<BuscarAsistenciaDto>
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<BuscarAsistenciaDto>
            {
                Success = false,
                Message = "Error al registrar la asistencia",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpPost("masivas")]
    public async Task<ActionResult<ApiResponse<string>>> RegistrarAsistenciasMasivas([FromBody] RegistrarAsistenciasMasivasDto dto)
    {
        try
        {
            // TODO: Obtener usuario actual del contexto del usuario autenticado
            var usuarioId = 1;

            await _asistenciaServicio.RegistrarAsistenciasMasivas(dto, usuarioId);
            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Asistencias registradas exitosamente"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<string>
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<string>
            {
                Success = false,
                Message = "Error al registrar las asistencias",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpDelete("clase/{claseId}/fecha/{fecha}")]
    public async Task<ActionResult<ApiResponse<string>>> EliminarAsistenciasPorClaseYFecha(
        int claseId,
        DateTime fecha)
    {
        try
        {
            await _asistenciaServicio.EliminarAsistenciasPorClaseYFecha(claseId, fecha);
            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = "Registro de asistencia eliminado exitosamente"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<string>
            {
                Success = false,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<string>
            {
                Success = false,
                Message = "Error al eliminar las asistencias",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    [HttpGet("faltas")]
    public async Task<ActionResult<ApiResponse<int>>> ContarFaltas(
        [FromQuery] int alumnoId,
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin)
    {
        try
        {
            var faltas = await _asistenciaServicio.ContarFaltasPorAlumnoYRango(alumnoId, fechaInicio, fechaFin);
            return Ok(new ApiResponse<int>
            {
                Success = true,
                Data = faltas
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<int>
            {
                Success = false,
                Message = "Error al contar las faltas",
                Errors = new List<string> { ex.Message }
            });
        }
    }
}
