using Api.Entidades;

namespace Api.Repositorios;

public interface ITipoConceptoRepositorio : IRepositorioGenerico<TipoConcepto>
{
    /// <summary>Retorna todos los tipos de concepto, opcionalmente filtrados por estado activo.</summary>
    Task<IEnumerable<TipoConcepto>> ObtenerTodosAsync(bool? activo = null);

    /// <summary>Verifica si ya existe un tipo con ese nombre (excluyendo el ID dado al editar).</summary>
    Task<bool> ExistePorNombreAsync(string nombre, int? idExcluir = null);
}
