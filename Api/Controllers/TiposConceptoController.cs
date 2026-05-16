using Api.Comun.Modelos.TiposConcepto;
using Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[Route("tipos-concepto")]
[Route("v1/tipos-concepto")]
public class TiposConceptoController : ControllerBase
{
    private readonly ITipoConceptoServicio _servicio;

    public TiposConceptoController(ITipoConceptoServicio servicio)
    {
        _servicio = servicio;
    }

    /// <summary>Lista todos los tipos de concepto. Se puede filtrar por estado activo.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BuscarTipoConceptoDto>>> ObtenerTipos(
        [FromQuery] bool? activo = null)
    {
        var tipos = await _servicio.ObtenerTodosAsync(activo);
        return Ok(tipos);
    }

    /// <summary>Obtiene un tipo de concepto por su ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BuscarTipoConceptoDto>> ObtenerTipoPorId(int id)
    {
        var tipo = await _servicio.ObtenerPorIdAsync(id);

        if (tipo == null)
        {
            return NotFound(new { mensaje = "Tipo de concepto no encontrado" });
        }

        return Ok(tipo);
    }

    /// <summary>Crea un nuevo tipo de concepto.</summary>
    [HttpPost]
    public async Task<ActionResult<BuscarTipoConceptoDto>> CrearTipo(
        [FromBody] CrearTipoConceptoDto dto)
    {
        var creado = await _servicio.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerTipoPorId), new { id = creado.Id }, creado);
    }

    /// <summary>Actualiza un tipo de concepto existente.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<BuscarTipoConceptoDto>> ActualizarTipo(
        int id,
        [FromBody] ModificarTipoConceptoDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { mensaje = "El ID de la ruta no coincide con el ID del cuerpo" });
        }

        var actualizado = await _servicio.ActualizarAsync(id, dto);
        return Ok(actualizado);
    }

    /// <summary>Desactiva lógicamente un tipo de concepto (borrado lógico).</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DesactivarTipo(int id)
    {
        await _servicio.DesactivarAsync(id);
        return Ok(new { mensaje = "Tipo de concepto desactivado correctamente" });
    }

    /// <summary>Elimina permanentemente un tipo de concepto.</summary>
    [HttpDelete("{id:int}/eliminar")]
    public async Task<ActionResult> EliminarTipo(int id)
    {
        await _servicio.EliminarAsync(id);
        return Ok(new { mensaje = "Tipo de concepto eliminado correctamente" });
    }

    /// <summary>Actualiza el orden de varios tipos de concepto en lote.</summary>
    [HttpPatch("reordenar")]
    public async Task<ActionResult> Reordenar([FromBody] List<ReordenarTipoConceptoDto> items)
    {
        await _servicio.ReordenarAsync(items);
        return Ok(new { mensaje = "Orden actualizado correctamente" });
    }
}
