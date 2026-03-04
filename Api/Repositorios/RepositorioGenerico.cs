using System.Linq.Expressions;
using Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositorios;

public class RepositorioGenerico<T> : IRepositorioGenerico<T> where T : class
{
    protected readonly AplicacionBdContexto _contexto;
    protected readonly DbSet<T> _dbSet;

    public RepositorioGenerico(AplicacionBdContexto contexto)
    {
        _contexto = contexto;
        _dbSet = contexto.Set<T>();
    }

    public virtual async Task<T?> ObtenerPorIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<T?> ObtenerPorSlugAsync(string slug)
    {
        // EF.Property<T>() accede a la propiedad "Slug" por nombre en lugar de e.Slug,
        // permitiendo que este método genérico funcione para cualquier entidad sin requerir
        // una restricción de tipo en la clase genérica T.
        var entidad = await _dbSet.FirstOrDefaultAsync(e => EF.Property<string>(e, "Slug") == slug);
        return entidad;
    }

    public virtual async Task<IEnumerable<T>> ObtenerTodosAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> BuscarAsync(Expression<Func<T, bool>> predicado)
    {
        return await _dbSet.Where(predicado).ToListAsync();
    }

    public virtual async Task<T> AgregarAsync(T entidad)
    {
        await _dbSet.AddAsync(entidad);
        await _contexto.SaveChangesAsync();
        return entidad;
    }

    public virtual async Task ActualizarAsync(T entidad)
    {
        _dbSet.Update(entidad);
        await _contexto.SaveChangesAsync();
    }

    public virtual async Task EliminarAsync(T entidad)
    {
        _dbSet.Remove(entidad);
        await _contexto.SaveChangesAsync();
    }

    public virtual async Task<bool> ExisteAsync(Expression<Func<T, bool>> predicado)
    {
        return await _dbSet.AnyAsync(predicado);
    }

    public virtual async Task<int> ContarAsync(Expression<Func<T, bool>>? predicado = null)
    {
        if (predicado == null)
            return await _dbSet.CountAsync();

        return await _dbSet.CountAsync(predicado);
    }
}
