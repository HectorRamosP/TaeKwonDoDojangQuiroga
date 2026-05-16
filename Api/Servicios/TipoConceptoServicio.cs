using Api.Comun.Modelos.TiposConcepto;
using Api.Entidades;
using Api.Repositorios;
using AutoMapper;

namespace Api.Servicios;

public class TipoConceptoServicio : ITipoConceptoServicio
{
    private readonly ITipoConceptoRepositorio _repositorio;
    private readonly IMapper _mapper;

    public TipoConceptoServicio(ITipoConceptoRepositorio repositorio, IMapper mapper)
    {
        _repositorio = repositorio;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BuscarTipoConceptoDto>> ObtenerTodosAsync(bool? activo = null)
    {
        var tipos = await _repositorio.ObtenerTodosAsync(activo);
        return _mapper.Map<IEnumerable<BuscarTipoConceptoDto>>(tipos);
    }

    public async Task<BuscarTipoConceptoDto?> ObtenerPorIdAsync(int id)
    {
        var tipo = await _repositorio.ObtenerPorIdAsync(id);
        return tipo == null ? null : _mapper.Map<BuscarTipoConceptoDto>(tipo);
    }

    public async Task<BuscarTipoConceptoDto> CrearAsync(CrearTipoConceptoDto dto)
    {
        if (await _repositorio.ExistePorNombreAsync(dto.Nombre))
        {
            throw new InvalidOperationException($"Ya existe un tipo de concepto con el nombre \"{dto.Nombre}\".");
        }

        var tipo = _mapper.Map<TipoConcepto>(dto);
        tipo.Activo = true;

        var creado = await _repositorio.AgregarAsync(tipo);
        return _mapper.Map<BuscarTipoConceptoDto>(creado);
    }

    public async Task<BuscarTipoConceptoDto> ActualizarAsync(int id, ModificarTipoConceptoDto dto)
    {
        var tipo = await _repositorio.ObtenerPorIdAsync(id);
        if (tipo == null)
        {
            throw new KeyNotFoundException("Tipo de concepto no encontrado.");
        }

        if (await _repositorio.ExistePorNombreAsync(dto.Nombre, idExcluir: id))
        {
            throw new InvalidOperationException($"Ya existe un tipo de concepto con el nombre \"{dto.Nombre}\".");
        }

        _mapper.Map(dto, tipo);
        await _repositorio.ActualizarAsync(tipo);

        return _mapper.Map<BuscarTipoConceptoDto>(tipo);
    }

    public async Task DesactivarAsync(int id)
    {
        var tipo = await _repositorio.ObtenerPorIdAsync(id);
        if (tipo == null)
            throw new KeyNotFoundException("Tipo de concepto no encontrado.");

        tipo.Activo = false;
        await _repositorio.ActualizarAsync(tipo);
    }

    public async Task EliminarAsync(int id)
    {
        var tipo = await _repositorio.ObtenerPorIdAsync(id);
        if (tipo == null)
            throw new KeyNotFoundException("Tipo de concepto no encontrado.");

        await _repositorio.EliminarAsync(tipo);
    }

    public async Task ReordenarAsync(IEnumerable<ReordenarTipoConceptoDto> items)
    {
        foreach (var item in items)
        {
            var tipo = await _repositorio.ObtenerPorIdAsync(item.Id);
            if (tipo != null)
            {
                tipo.Orden = item.Orden;
                await _repositorio.ActualizarAsync(tipo);
            }
        }
    }
}
