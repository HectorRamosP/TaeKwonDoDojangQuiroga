using Api.Comun.Modelos.Alumnos;
using Api.Entidades;
using Api.Persistencia;
using Api.Repositorios;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Api.Servicios;

public class AlumnoServicio : IAlumnoServicio
{
    private readonly IAlumnoRepositorio _repositorio;
    private readonly IMapper _mapper;
    private readonly AplicacionBdContexto _contexto;

    public AlumnoServicio(IAlumnoRepositorio repositorio, IMapper mapper, AplicacionBdContexto contexto)
    {
        _repositorio = repositorio;
        _mapper = mapper;
        _contexto = contexto;
    }

    public async Task<IEnumerable<BuscarAlumnoDto>> ObtenerTodosAsync(
        string? nombre = null,
        bool? activo = null,
        int? cintaId = null,
        int? claseId = null,
        int? conceptoId = null,
        int? edadMinima = null,
        int? edadMaxima = null)
    {
        IEnumerable<Alumno> alumnos;

        if (cintaId.HasValue || claseId.HasValue || conceptoId.HasValue || edadMinima.HasValue || edadMaxima.HasValue || activo.HasValue)
        {
            alumnos = await _repositorio.BuscarConFiltrosAsync(cintaId, claseId, conceptoId, activo, edadMinima, edadMaxima);
        }
        else
        {
            alumnos = await _repositorio.ObtenerConInscripcionesAsync();
        }

        if (!string.IsNullOrEmpty(nombre))
        {
            var nombreLower = nombre.ToLower();
            alumnos = alumnos.Where(a =>
                a.Nombre.ToLower().Contains(nombreLower) ||
                a.ApellidoPaterno.ToLower().Contains(nombreLower) ||
                a.ApellidoMaterno.ToLower().Contains(nombreLower));
        }

        return _mapper.Map<IEnumerable<BuscarAlumnoDto>>(alumnos);
    }

    public async Task<BuscarAlumnoDto?> ObtenerPorSlugAsync(string slug)
    {
        var alumno = await _repositorio.ObtenerPorSlugConInscripcionesAsync(slug);
        return alumno == null ? null : _mapper.Map<BuscarAlumnoDto>(alumno);
    }

    public async Task<BuscarAlumnoDto> CrearAsync(CrearAlumnoDto dto)
    {
        if (await _repositorio.ExistePorEmailAsync(dto.EmailTutor ?? string.Empty))
        {
            throw new InvalidOperationException("Ya existe un alumno con este email");
        }

        if (await _repositorio.ExistePorTelefonoAsync(dto.TelefonoTutor))
        {
            throw new InvalidOperationException("Ya existe un alumno con este teléfono");
        }

        var alumno = _mapper.Map<Alumno>(dto);
        var alumnoCreado = await _repositorio.AgregarAsync(alumno);

        var alumnoCompleto = await _repositorio.ObtenerPorSlugConInscripcionesAsync(alumnoCreado.Slug);
        return _mapper.Map<BuscarAlumnoDto>(alumnoCompleto!);
    }

    public async Task<BuscarAlumnoDto> ActualizarAsync(string slug, ModificarAlumnoDto dto)
    {
        var alumno = await _repositorio.ObtenerPorSlugAsync(slug);
        if (alumno == null)
        {
            throw new KeyNotFoundException("Alumno no encontrado");
        }

        if (!string.IsNullOrEmpty(dto.EmailTutor) && await _repositorio.ExistePorEmailAsync(dto.EmailTutor, slug))
        {
            throw new InvalidOperationException("Ya existe un alumno con este email");
        }

        if (await _repositorio.ExistePorTelefonoAsync(dto.TelefonoTutor, slug))
        {
            throw new InvalidOperationException("Ya existe un alumno con este teléfono");
        }

        _mapper.Map(dto, alumno);
        await _repositorio.ActualizarAsync(alumno);

        var alumnoActualizado = await _repositorio.ObtenerPorSlugConInscripcionesAsync(slug);
        return _mapper.Map<BuscarAlumnoDto>(alumnoActualizado!);
    }

    public async Task CambiarEstadoAsync(string slug, bool activo)
    {
        var alumno = await _repositorio.ObtenerPorSlugAsync(slug);
        if (alumno == null)
        {
            throw new KeyNotFoundException("Alumno no encontrado");
        }

        alumno.Activo = activo;
        await _repositorio.ActualizarAsync(alumno);
    }

    public async Task EliminarPermanenteAsync(string slug)
    {
        var alumno = await _repositorio.ObtenerPorSlugAsync(slug);
        if (alumno == null)
        {
            throw new KeyNotFoundException("Alumno no encontrado");
        }

        if (alumno.Activo)
        {
            throw new InvalidOperationException("Solo se pueden eliminar alumnos desactivados");
        }

        // Eliminar manualmente los pagos asociados (ya que DeleteBehavior.Restrict no permite cascade)
        var pagos = await _contexto.Pagos.Where(p => p.AlumnoId == alumno.Id).ToListAsync();
        if (pagos.Any())
        {
            _contexto.Pagos.RemoveRange(pagos);
            await _contexto.SaveChangesAsync();
        }

        // Ahora eliminar el alumno (AlumnoInscripciones y Asistencias se eliminan automáticamente por CASCADE)
        await _repositorio.EliminarAsync(alumno);
    }

    public async Task<bool> ExisteEmailAsync(string email, string? slugExcluir = null)
    {
        return await _repositorio.ExistePorEmailAsync(email, slugExcluir);
    }

    public async Task<bool> ExisteTelefonoAsync(string telefono, string? slugExcluir = null)
    {
        return await _repositorio.ExistePorTelefonoAsync(telefono, slugExcluir);
    }
}
