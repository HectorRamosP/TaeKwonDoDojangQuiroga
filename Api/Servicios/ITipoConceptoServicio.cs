using Api.Comun.Modelos.TiposConcepto;

namespace Api.Servicios;

public interface ITipoConceptoServicio
{
    Task<IEnumerable<BuscarTipoConceptoDto>> ObtenerTodosAsync(bool? activo = null);
    Task<BuscarTipoConceptoDto?> ObtenerPorIdAsync(int id);
    Task<BuscarTipoConceptoDto> CrearAsync(CrearTipoConceptoDto dto);
    Task<BuscarTipoConceptoDto> ActualizarAsync(int id, ModificarTipoConceptoDto dto);
    Task DesactivarAsync(int id);
}
