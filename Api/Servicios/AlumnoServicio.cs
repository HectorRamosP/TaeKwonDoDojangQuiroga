using Api.Comun.Modelos.Alumnos;
using Api.Comun.Modelos.Asistencias;
using Api.Entidades;
using Api.Persistencia;
using Api.Repositorios;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Api.Servicios;

public class AlumnoServicio : IAlumnoServicio
{
    private readonly IAlumnoRepositorio _repositorio;
    private readonly IAsistenciaRepositorio _asistenciaRepo;
    private readonly IMapper _mapper;
    private readonly AplicacionBdContexto _contexto;

    public AlumnoServicio(IAlumnoRepositorio repositorio, IAsistenciaRepositorio asistenciaRepo, IMapper mapper, AplicacionBdContexto contexto)
    {
        _repositorio = repositorio;
        _asistenciaRepo = asistenciaRepo;
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

        // Optimización: si hay filtros de BD (cinta, clase, edad, etc.) se delegan al repositorio
        // para que el WHERE se ejecute en SQL. El filtro por nombre se aplica en memoria después
        // porque LINQ-to-SQL no maneja bien Contains con normalización de acentos en español.
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

        // Si se asignó una cinta al crear, registrar en el historial de progresión
        if (alumnoCreado.CintaActualId.HasValue)
        {
            _contexto.HistorialCintas.Add(new HistorialCinta
            {
                AlumnoId = alumnoCreado.Id,
                CintaId = alumnoCreado.CintaActualId.Value,
                FechaObtencion = DateTime.UtcNow,
                Observaciones = "Cinta inicial al registrar alumno"
            });
            await _contexto.SaveChangesAsync();
        }

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

        // Capturar la cinta anterior antes de actualizar
        var cintaAnteriorId = alumno.CintaActualId;

        _mapper.Map(dto, alumno);
        await _repositorio.ActualizarAsync(alumno);

        // Si la cinta cambió, registrar en el historial de progresión
        if (alumno.CintaActualId.HasValue && alumno.CintaActualId != cintaAnteriorId)
        {
            var yaExiste = await _contexto.HistorialCintas
                .AnyAsync(h => h.AlumnoId == alumno.Id && h.CintaId == alumno.CintaActualId.Value);

            if (!yaExiste)
            {
                _contexto.HistorialCintas.Add(new HistorialCinta
                {
                    AlumnoId = alumno.Id,
                    CintaId = alumno.CintaActualId.Value,
                    FechaObtencion = DateTime.UtcNow,
                    Observaciones = null
                });
                await _contexto.SaveChangesAsync();
            }
        }

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

    public async Task<PerfilAlumnoDto?> ObtenerPerfilAsync(string slug, DateTime? fechaInicio = null, DateTime? fechaFin = null)
    {
        var alumno = await _repositorio.ObtenerPorSlugConInscripcionesAsync(slug);
        if (alumno == null) return null;

        var alumnoDto = _mapper.Map<BuscarAlumnoDto>(alumno);

        // Obtener asistencias (con o sin rango de fechas)
        List<Asistencia> asistencias;
        if (fechaInicio.HasValue && fechaFin.HasValue)
        {
            asistencias = await _asistenciaRepo.ObtenerPorAlumnoYRangoFechas(alumno.Id, fechaInicio.Value, fechaFin.Value);
        }
        else
        {
            asistencias = await _asistenciaRepo.ObtenerPorAlumno(alumno.Id);
        }

        var asistenciasDto = _mapper.Map<List<BuscarAsistenciaDto>>(asistencias);

        // Calcular resumen
        var totalPresencias = asistencias.Count(a => a.Presente);
        var totalFaltas = asistencias.Count(a => !a.Presente);
        var totalRegistros = asistencias.Count;
        var porcentaje = totalRegistros > 0 ? Math.Round((decimal)totalPresencias / totalRegistros * 100, 1) : 0;
        var totalJustificadas = asistencias.Count(a => !a.Presente && a.Justificada);

        // Obtener historial de cintas
        var historialCintas = await _contexto.HistorialCintas
            .Include(h => h.Cinta)
            .Where(h => h.AlumnoId == alumno.Id)
            .OrderBy(h => h.FechaObtencion)
            .ToListAsync();

        var historialDto = historialCintas.Select(h => new HistorialCintaDto
        {
            Id = h.Id,
            FechaObtencion = h.FechaObtencion,
            Observaciones = h.Observaciones,
            CintaId = h.CintaId,
            CintaNombre = h.Cinta.Nombre,
            CintaColorHex = h.Cinta.ColorHex,
            CintaOrden = h.Cinta.Orden
        }).ToList();

        return new PerfilAlumnoDto
        {
            Alumno = alumnoDto,
            TotalPresencias = totalPresencias,
            TotalFaltas = totalFaltas,
            PorcentajeAsistencia = porcentaje,
            TotalJustificadas = totalJustificadas,
            Asistencias = asistenciasDto,
            HistorialCintas = historialDto
        };
    }
}
