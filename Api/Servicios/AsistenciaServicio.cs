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
            Justificada = !dto.Presente && dto.Justificada,
            Observacion = dto.Observacion,
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

        // Patrón upsert: se carga la lista existente una sola vez y luego por cada alumno
        // se decide si actualizar (ya tiene registro ese día) o insertar (primera vez).
        // Esto permite corregir asistencias ya guardadas sin crear duplicados.
        var asistenciasExistentes = await _asistenciaRepo.ObtenerPorClaseYFecha(dto.ClaseId, dto.Fecha);

        foreach (var asistenciaDto in dto.Asistencias)
        {
            var existente = asistenciasExistentes.FirstOrDefault(a => a.AlumnoId == asistenciaDto.AlumnoId);

            if (existente != null)
            {
                existente.Presente = asistenciaDto.Presente;
                existente.Justificada = !asistenciaDto.Presente && asistenciaDto.Justificada;
                existente.Observacion = asistenciaDto.Observacion;
                await _asistenciaRepo.ActualizarAsync(existente);
            }
            else
            {
                var asistencia = new Asistencia
                {
                    AlumnoId = asistenciaDto.AlumnoId,
                    ClaseId = dto.ClaseId,
                    Fecha = dto.Fecha.Date,
                    Presente = asistenciaDto.Presente,
                    Justificada = !asistenciaDto.Presente && asistenciaDto.Justificada,
                    Observacion = asistenciaDto.Observacion,
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

    public async Task JustificarFaltaAsync(int asistenciaId, bool justificada, string? observacion)
    {
        var asistencia = await _asistenciaRepo.ObtenerPorIdAsync(asistenciaId);
        if (asistencia == null)
            throw new KeyNotFoundException("Asistencia no encontrada");

        if (asistencia.Presente)
            throw new InvalidOperationException("Solo se pueden justificar las faltas, no las presencias");

        asistencia.Justificada = justificada;
        asistencia.Observacion = observacion;
        await _asistenciaRepo.ActualizarAsync(asistencia);
    }
}
