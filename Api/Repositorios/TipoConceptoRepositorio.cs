using Api.Entidades;
using Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositorios;

public class TipoConceptoRepositorio : RepositorioGenerico<TipoConcepto>, ITipoConceptoRepositorio
{
    public TipoConceptoRepositorio(AplicacionBdContexto contexto) : base(contexto)
    {
    }

    public async Task<IEnumerable<TipoConcepto>> ObtenerTodosAsync(bool? activo = null)
    {
        var query = _dbSet.AsQueryable();

        if (activo.HasValue)
        {
            query = query.Where(t => t.Activo == activo.Value);
        }

        return await query
            .OrderBy(t => t.Orden)
            .ThenBy(t => t.Nombre)
            .ToListAsync();
    }

    public async Task<bool> ExistePorNombreAsync(string nombre, int? idExcluir = null)
    {
        var query = _dbSet.Where(t => t.Nombre.ToLower() == nombre.ToLower());

        if (idExcluir.HasValue)
        {
            query = query.Where(t => t.Id != idExcluir.Value);
        }

        return await query.AnyAsync();
    }
}
