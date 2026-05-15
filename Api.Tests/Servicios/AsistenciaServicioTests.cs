using Api.Comun.Modelos.Asistencias;
using Api.Entidades;
using Api.Repositorios;
using Api.Servicios;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Api.Tests.Servicios;

/// <summary>
/// Pruebas unitarias para AsistenciaServicio.
/// Se utilizan STUBS para simular alumno, clase y asistencias existentes,
/// y MOCKS para verificar que los métodos del repositorio se invocan correctamente.
/// </summary>
public class AsistenciaServicioTests
{
    private readonly Mock<IAsistenciaRepositorio> _asistenciaRepoMock;
    private readonly Mock<IAlumnoRepositorio>     _alumnoRepoMock;
    private readonly Mock<IClaseRepositorio>      _claseRepoMock;
    private readonly Mock<IMapper>                _mapperMock;
    private readonly AsistenciaServicio           _servicio;

    public AsistenciaServicioTests()
    {
        _asistenciaRepoMock = new Mock<IAsistenciaRepositorio>();
        _alumnoRepoMock     = new Mock<IAlumnoRepositorio>();
        _claseRepoMock      = new Mock<IClaseRepositorio>();
        _mapperMock         = new Mock<IMapper>();

        _servicio = new AsistenciaServicio(
            _asistenciaRepoMock.Object,
            _alumnoRepoMock.Object,
            _claseRepoMock.Object,
            _mapperMock.Object);
    }

    // ==========================================================================
    // PRUEBAS — RegistrarAsistencia
    // ==========================================================================

    [Fact]
    public async Task RegistrarAsistencia_DatosValidos_RegistraCorrectamente()
    {
        // ARRANGE
        var dto = new RegistrarAsistenciaDto
        {
            AlumnoId = 1,
            ClaseId  = 2,
            Fecha    = new DateTime(2025, 5, 8),
            Presente = true
        };

        var alumnoStub     = new Alumno    { Id = 1 };
        var claseStub      = new Clase     { Id = 2 };
        var asistenciaGuardada = new Asistencia { Id = 10, AlumnoId = 1, ClaseId = 2, Presente = true };
        var dtoResultado   = new BuscarAsistenciaDto { Id = 10, Presente = true };

        // STUB: alumno y clase existen, sin asistencia previa
        _alumnoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(alumnoStub);
        _claseRepoMock.Setup(r => r.ObtenerPorIdAsync(2)).ReturnsAsync(claseStub);
        _asistenciaRepoMock
            .Setup(r => r.ObtenerPorAlumnoClaseYFecha(1, 2, dto.Fecha))
            .ReturnsAsync((Asistencia?)null);

        _asistenciaRepoMock
            .Setup(r => r.AgregarAsync(It.IsAny<Asistencia>()))
            .ReturnsAsync(asistenciaGuardada);

        _asistenciaRepoMock
            .Setup(r => r.ObtenerPorIdConRelaciones(It.IsAny<int>()))
            .ReturnsAsync(asistenciaGuardada);

        _mapperMock.Setup(m => m.Map<BuscarAsistenciaDto>(asistenciaGuardada)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.RegistrarAsistencia(dto, usuarioId: 1);

        // ASSERT — MOCK: verificar que AgregarAsync fue llamado 1 vez
        _asistenciaRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Asistencia>()), Times.Once);
        resultado.Should().NotBeNull();
        resultado.Presente.Should().BeTrue();
    }

    [Fact]
    public async Task RegistrarAsistencia_AlumnoInexistente_LanzaArgumentException()
    {
        // ARRANGE — STUB: alumno no existe
        var dto = new RegistrarAsistenciaDto { AlumnoId = 99, ClaseId = 1, Fecha = DateTime.Today, Presente = true };

        _alumnoRepoMock
            .Setup(r => r.ObtenerPorIdAsync(99))
            .ReturnsAsync((Alumno?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.RegistrarAsistencia(dto, 1))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("El alumno no existe");

        // MOCK: verificar que AgregarAsync NUNCA fue llamado
        _asistenciaRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Asistencia>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarAsistencia_ClaseInexistente_LanzaArgumentException()
    {
        // ARRANGE — STUB: alumno existe pero clase no
        var dto = new RegistrarAsistenciaDto { AlumnoId = 1, ClaseId = 99, Fecha = DateTime.Today, Presente = true };

        _alumnoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(new Alumno { Id = 1 });
        _claseRepoMock
            .Setup(r => r.ObtenerPorIdAsync(99))
            .ReturnsAsync((Clase?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.RegistrarAsistencia(dto, 1))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("La clase no existe");

        _asistenciaRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Asistencia>()), Times.Never);
    }

    [Fact]
    public async Task RegistrarAsistencia_AsistenciaDuplicada_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: ya existe un registro para ese alumno, clase y fecha
        var dto = new RegistrarAsistenciaDto
        {
            AlumnoId = 1,
            ClaseId  = 2,
            Fecha    = new DateTime(2025, 5, 8),
            Presente = true
        };

        _alumnoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(new Alumno { Id = 1 });
        _claseRepoMock.Setup(r => r.ObtenerPorIdAsync(2)).ReturnsAsync(new Clase { Id = 2 });
        _asistenciaRepoMock
            .Setup(r => r.ObtenerPorAlumnoClaseYFecha(1, 2, dto.Fecha))
            .ReturnsAsync(new Asistencia { Id = 5, AlumnoId = 1, ClaseId = 2 });

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.RegistrarAsistencia(dto, 1))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Ya existe un registro de asistencia para este alumno, clase y fecha");

        _asistenciaRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Asistencia>()), Times.Never);
    }

    // ==========================================================================
    // PRUEBAS — JustificarFaltaAsync
    // ==========================================================================

    [Fact]
    public async Task JustificarFaltaAsync_FaltaExistente_JustificaCorrectamente()
    {
        // ARRANGE — STUB: asistencia con falta (Presente = false)
        var asistencia = new Asistencia { Id = 1, Presente = false, Justificada = false };

        _asistenciaRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(asistencia);
        _asistenciaRepoMock.Setup(r => r.ActualizarAsync(asistencia)).Returns(Task.CompletedTask);

        // ACT
        await _servicio.JustificarFaltaAsync(1, justificada: true, observacion: "Enfermedad");

        // ASSERT — MOCK: verificar que ActualizarAsync fue llamado con la asistencia justificada
        _asistenciaRepoMock.Verify(
            r => r.ActualizarAsync(It.Is<Asistencia>(a => a.Justificada == true && a.Observacion == "Enfermedad")),
            Times.Once);
    }

    [Fact]
    public async Task JustificarFaltaAsync_AsistenciaInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: no encontrada
        _asistenciaRepoMock
            .Setup(r => r.ObtenerPorIdAsync(999))
            .ReturnsAsync((Asistencia?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.JustificarFaltaAsync(999, true, null))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Asistencia no encontrada");
    }

    [Fact]
    public async Task JustificarFaltaAsync_AlumnoPresente_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: asistencia con presencia (no se puede justificar)
        var asistencia = new Asistencia { Id = 1, Presente = true };

        _asistenciaRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(asistencia);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.JustificarFaltaAsync(1, true, null))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Solo se pueden justificar las faltas, no las presencias");
    }

    // ==========================================================================
    // PRUEBAS — EliminarAsistenciasPorClaseYFecha
    // ==========================================================================

    [Fact]
    public async Task EliminarAsistenciasPorClaseYFecha_ClaseInexistente_LanzaArgumentException()
    {
        // ARRANGE — STUB: clase no existe
        _claseRepoMock
            .Setup(r => r.ObtenerPorIdAsync(99))
            .ReturnsAsync((Clase?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.EliminarAsistenciasPorClaseYFecha(99, DateTime.Today))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("La clase no existe");
    }

    [Fact]
    public async Task EliminarAsistenciasPorClaseYFecha_ClaseConAsistencias_EliminaTodas()
    {
        // ARRANGE — STUB: clase existe con 3 asistencias
        var clase = new Clase { Id = 1 };
        var fecha = new DateTime(2025, 5, 8);
        var asistencias = new List<Asistencia>
        {
            new() { Id = 1, ClaseId = 1 },
            new() { Id = 2, ClaseId = 1 },
            new() { Id = 3, ClaseId = 1 }
        };

        _claseRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(clase);
        _asistenciaRepoMock.Setup(r => r.ObtenerPorClaseYFecha(1, fecha)).ReturnsAsync(asistencias);
        _asistenciaRepoMock.Setup(r => r.EliminarAsync(It.IsAny<Asistencia>())).Returns(Task.CompletedTask);

        // ACT
        await _servicio.EliminarAsistenciasPorClaseYFecha(1, fecha);

        // ASSERT — MOCK: verificar que EliminarAsync fue llamado 3 veces (una por asistencia)
        _asistenciaRepoMock.Verify(r => r.EliminarAsync(It.IsAny<Asistencia>()), Times.Exactly(3));
    }
}
