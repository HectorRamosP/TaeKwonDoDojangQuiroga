using Api.Comun.Modelos.Alumnos;

namespace Api.Servicios;

public interface IAlumnoServicio
{
    Task<IEnumerable<BuscarAlumnoDto>> ObtenerTodosAsync(
        string? nombre = null,
        bool? activo = null,
        int? cintaId = null,
        int? claseId = null,
        int? conceptoId = null,
        int? edadMinima = null,
        int? edadMaxima = null);

    Task<BuscarAlumnoDto?> ObtenerPorSlugAsync(string slug);
    Task<BuscarAlumnoDto> CrearAsync(CrearAlumnoDto dto);
    Task<BuscarAlumnoDto> ActualizarAsync(string slug, ModificarAlumnoDto dto);
    Task CambiarEstadoAsync(string slug, bool activo);
    Task EliminarPermanenteAsync(string slug);
    Task<bool> ExisteEmailAsync(string email, string? slugExcluir = null);
    Task<bool> ExisteTelefonoAsync(string telefono, string? slugExcluir = null);
    Task<PerfilAlumnoDto?> ObtenerPerfilAsync(string slug, DateTime? fechaInicio = null, DateTime? fechaFin = null);
    Task<IEnumerable<BuscarAlumnoDto>> ObtenerProximosAVencerAsync(int dias);
}
