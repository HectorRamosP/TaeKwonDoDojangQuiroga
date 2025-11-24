using Api.Comun.Modelos.Asistencias;
using Api.Entidades;
using Api.Repositorios;
using AutoMapper;

namespace Api.Servicios;

public class AsistenciaServicio : IAsistenciaServicio
{
    private readonly IAsistenciaRepositorio _asistenciaRepo;
    private readonly IAlumnoRepositorio _alumnoRepo;
    private readonly IClaseRepositorio _claseRepo;
    private readonly IMapper _mapper;

    public AsistenciaServicio(
        IAsistenciaRepositorio asistenciaRepo,
        IAlumnoRepositorio alumnoRepo,
        IClaseRepositorio claseRepo,
        IMapper mapper)
    {
        _asistenciaRepo = asistenciaRepo;
        _alumnoRepo = alumnoRepo;
        _claseRepo = claseRepo;
        _mapper = mapper;
    }

    public async Task<List<BuscarAsistenciaDto>> ObtenerAsistencias(int? claseId = null, int? alumnoId = null, DateTime? fecha = null)
    {
        List<Asistencia> asistencias;

        if (claseId.HasValue && fecha.HasValue)
        {
            asistencias = await _asistenciaRepo.ObtenerPorClaseYFecha(claseId.Value, fecha.Value);
        }
        else if (alumnoId.HasValue)
        {
            asistencias = await _asistenciaRepo.ObtenerPorAlumno(alumnoId.Value);
        }
        else
        {
            asistencias = await _asistenciaRepo.ObtenerTodasConRelaciones();
        }

        return _mapper.Map<List<BuscarAsistenciaDto>>(asistencias);
    }

    public async Task<BuscarAsistenciaDto?> ObtenerAsistenciaPorId(int id)
    {
        var asistencia = await _asistenciaRepo.ObtenerPorIdConRelaciones(id);
        return asistencia == null ? null : _mapper.Map<BuscarAsistenciaDto>(asistencia);
    }

    public async Task<BuscarAsistenciaDto> RegistrarAsistencia(RegistrarAsistenciaDto dto, int usuarioId)
    {
        // Verificar que el alumno existe
        var alumno = await _alumnoRepo.ObtenerPorIdAsync(dto.AlumnoId);
        if (alumno == null)
            throw new ArgumentException("El alumno no existe");

        // Verificar que la clase existe
        var clase = await _claseRepo.ObtenerPorIdAsync(dto.ClaseId);
        if (clase == null)
            throw new ArgumentException("La clase no existe");

        // Verificar que no exista ya una asistencia para este alumno, clase y fecha
        var asistenciaExistente = await _asistenciaRepo.ObtenerPorAlumnoClaseYFecha(dto.AlumnoId, dto.ClaseId, dto.Fecha);
        if (asistenciaExistente != null)
            throw new InvalidOperationException("Ya existe un registro de asistencia para este alumno, clase y fecha");

        var asistencia = new Asistencia
        {
            AlumnoId = dto.AlumnoId,
            ClaseId = dto.ClaseId,
            Fecha = dto.Fecha.Date,
            Presente = dto.Presente,
            UsuarioRegistroId = usuarioId
        };

        await _asistenciaRepo.AgregarAsync(asistencia);

        // Recargar la asistencia con las relaciones
        var asistenciaCompleta = await _asistenciaRepo.ObtenerPorIdConRelaciones(asistencia.Id);
        return _mapper.Map<BuscarAsistenciaDto>(asistenciaCompleta);
    }

    public async Task RegistrarAsistenciasMasivas(RegistrarAsistenciasMasivasDto dto, int usuarioId)
    {
        // Verificar que la clase existe
        var clase = await _claseRepo.ObtenerPorIdAsync(dto.ClaseId);
        if (clase == null)
            throw new ArgumentException("La clase no existe");

        // Verificar que todos los alumnos existen
        foreach (var asistenciaDto in dto.Asistencias)
        {
            var alumno = await _alumnoRepo.ObtenerPorIdAsync(asistenciaDto.AlumnoId);
            if (alumno == null)
                throw new ArgumentException($"El alumno con ID {asistenciaDto.AlumnoId} no existe");
        }

        // Verificar si ya existen registros para esta fecha y clase
        var asistenciasExistentes = await _asistenciaRepo.ObtenerPorClaseYFecha(dto.ClaseId, dto.Fecha);

        foreach (var asistenciaDto in dto.Asistencias)
        {
            var existente = asistenciasExistentes.FirstOrDefault(a => a.AlumnoId == asistenciaDto.AlumnoId);

            if (existente != null)
            {
                // Actualizar si ya existe
                existente.Presente = asistenciaDto.Presente;
                await _asistenciaRepo.ActualizarAsync(existente);
            }
            else
            {
                // Crear nuevo registro
                var asistencia = new Asistencia
                {
                    AlumnoId = asistenciaDto.AlumnoId,
                    ClaseId = dto.ClaseId,
                    Fecha = dto.Fecha.Date,
                    Presente = asistenciaDto.Presente,
                    UsuarioRegistroId = usuarioId
                };
                await _asistenciaRepo.AgregarAsync(asistencia);
            }
        }
    }

    public async Task<int> ContarFaltasPorAlumnoYRango(int alumnoId, DateTime fechaInicio, DateTime fechaFin)
    {
        return await _asistenciaRepo.ContarFaltasPorAlumnoYRango(alumnoId, fechaInicio, fechaFin);
    }

    public async Task EliminarAsistenciasPorClaseYFecha(int claseId, DateTime fecha)
    {
        // Verificar que la clase existe
        var clase = await _claseRepo.ObtenerPorIdAsync(claseId);
        if (clase == null)
            throw new ArgumentException("La clase no existe");

        // Obtener todas las asistencias de esa clase y fecha
        var asistencias = await _asistenciaRepo.ObtenerPorClaseYFecha(claseId, fecha);

        // Eliminar todas las asistencias
        foreach (var asistencia in asistencias)
        {
            await _asistenciaRepo.EliminarAsync(asistencia);
        }
    }
}
