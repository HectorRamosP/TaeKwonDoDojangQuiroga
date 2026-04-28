using Api.Comun.Modelos.Alumnos;
using Api.Servicios;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[ApiVersion("1.0")]
[Route("alumnos")]
[Route("v{version:apiVersion}/alumnos")]
public class AlumnosController : ControllerBase
{
    private readonly IAlumnoServicio _alumnoServicio;

    public AlumnosController(IAlumnoServicio alumnoServicio)
    {
        _alumnoServicio = alumnoServicio;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BuscarAlumnoDto>>> ObtenerAlumnos(
        [FromQuery] string? nombre = null,
        [FromQuery] bool? activo = null,
        [FromQuery] int? cintaId = null,
        [FromQuery] int? claseId = null,
        [FromQuery] int? conceptoId = null,
        [FromQuery] int? edadMinima = null,
        [FromQuery] int? edadMaxima = null)
    {
        var alumnos = await _alumnoServicio.ObtenerTodosAsync(
            nombre, activo, cintaId, claseId, conceptoId, edadMinima, edadMaxima);

        return Ok(alumnos);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BuscarAlumnoDto>> ObtenerAlumnoPorSlug(string slug)
    {
        var alumno = await _alumnoServicio.ObtenerPorSlugAsync(slug);

        if (alumno == null)
        {
            return NotFound(new { mensaje = "Alumno no encontrado" });
        }

        return Ok(alumno);
    }

    [HttpPost]
    public async Task<ActionResult<BuscarAlumnoDto>> CrearAlumno([FromBody] CrearAlumnoDto dto)
    {
        var alumno = await _alumnoServicio.CrearAsync(dto);

        return CreatedAtAction(
            nameof(ObtenerAlumnoPorSlug),
            new { slug = alumno.Slug },
            alumno);
    }

    [HttpPut("{slug}")]
    public async Task<ActionResult<BuscarAlumnoDto>> ActualizarAlumno(
        string slug,
        [FromBody] ModificarAlumnoDto dto)
    {
        if (slug != dto.Slug)
        {
            return BadRequest(new { mensaje = "El slug no coincide" });
        }

        var alumno = await _alumnoServicio.ActualizarAsync(slug, dto);
        return Ok(alumno);
    }

    [HttpPatch("{slug}/estado")]
    public async Task<ActionResult> CambiarEstado(
        string slug,
        [FromBody] CambiarEstadoAlumnoDto dto)
    {
        if (slug != dto.Slug)
        {
            return BadRequest(new { mensaje = "El slug no coincide" });
        }

        await _alumnoServicio.CambiarEstadoAsync(slug, dto.Activo);
        return Ok(new { mensaje = $"Alumno {(dto.Activo ? "activado" : "desactivado")} correctamente" });
    }

    [HttpDelete("{slug}/permanente")]
    public async Task<ActionResult> EliminarPermanente(string slug)
    {
        await _alumnoServicio.EliminarPermanenteAsync(slug);
        return Ok(new { mensaje = "Alumno eliminado permanentemente" });
    }

    [HttpGet("{slug}/perfil")]
    public async Task<ActionResult<PerfilAlumnoDto>> ObtenerPerfilAlumno(
        string slug,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] DateTime? fechaFin = null)
    {
        var perfil = await _alumnoServicio.ObtenerPerfilAsync(slug, fechaInicio, fechaFin);

        if (perfil == null)
        {
            return NotFound(new { mensaje = "Alumno no encontrado" });
        }

        return Ok(perfil);
    }

    [HttpGet("alertas-vencimiento")]
    public async Task<ActionResult<IEnumerable<BuscarAlumnoDto>>> ObtenerAlertasVencimiento()
    {
        var alumnos = await _alumnoServicio.ObtenerProximosAVencerAsync(dias: 5);

        if (alumnos == null || !alumnos.Any())
        {
            return Ok(new List<BuscarAlumnoDto>());
        }

        return Ok(alumnos);
    }
}
