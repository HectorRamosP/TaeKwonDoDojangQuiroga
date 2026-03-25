using Api.Comun.Modelos.Alumnos;
using Api.Entidades;
using Api.Repositorios;
using Api.Servicios;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Api.Tests.Servicios;

/// <summary>
/// Pruebas unitarias para AlumnoServicio.
/// Se utilizan STUBS para simular datos devueltos por el repositorio
/// y MOCKS para verificar que los métodos del repositorio se invocan correctamente.
/// </summary>
public class AlumnoServicioTests
{
    // --------------------------------------------------------------------------
    // Dependencias mockeadas (se crean una vez y se reutilizan en cada prueba)
    // --------------------------------------------------------------------------
    private readonly Mock<IAlumnoRepositorio> _repositorioMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly AlumnoServicio _servicio;

    public AlumnoServicioTests()
    {
        _repositorioMock = new Mock<IAlumnoRepositorio>();
        _mapperMock      = new Mock<IMapper>();

        // Se inyectan las dependencias mockeadas al servicio bajo prueba.
        // El tercer parámetro (AplicacionBdContexto) se pasa como null porque
        // solo es utilizado en EliminarPermanenteAsync, que tiene sus propias pruebas.
        _servicio = new AlumnoServicio(_repositorioMock.Object, _mapperMock.Object, null!);
    }

    // ==========================================================================
    // PRUEBAS UNITARIAS — ObtenerTodosAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerTodosAsync_SinFiltros_RetornaTodosLosAlumnos()
    {
        // ARRANGE — STUB: el repositorio devuelve una lista fija de alumnos
        var alumnosStub = new List<Alumno>
        {
            new() { Id = 1, Nombre = "Carlos",  ApellidoPaterno = "Lopez",   ApellidoMaterno = "Ruiz",   Activo = true,  FechaNacimiento = new DateTime(2010, 1, 1) },
            new() { Id = 2, Nombre = "Ana",     ApellidoPaterno = "Perez",   ApellidoMaterno = "Torres", Activo = true,  FechaNacimiento = new DateTime(2012, 5, 15) },
            new() { Id = 3, Nombre = "Luis",    ApellidoPaterno = "Ramirez", ApellidoMaterno = "Soto",   Activo = false, FechaNacimiento = new DateTime(2008, 9, 20) }
        };

        var dtosEsperados = alumnosStub.Select(a => new BuscarAlumnoDto
        {
            Id     = a.Id,
            Nombre = a.Nombre,
            Activo = a.Activo
        }).ToList();

        // STUB: cuando se llame ObtenerConInscripcionesAsync, devolver la lista fija
        _repositorioMock
            .Setup(r => r.ObtenerConInscripcionesAsync())
            .ReturnsAsync(alumnosStub);

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarAlumnoDto>>(It.IsAny<IEnumerable<Alumno>>()))
            .Returns(dtosEsperados);

        // ACT
        var resultado = await _servicio.ObtenerTodosAsync();

        // ASSERT
        resultado.Should().NotBeNull();
        resultado.Should().HaveCount(3);
    }

    [Fact]
    public async Task ObtenerTodosAsync_FiltrandoPorNombre_RetornaSoloCoincidencias()
    {
        // ARRANGE — STUB con 3 alumnos, solo 1 coincide con "ana"
        var alumnosStub = new List<Alumno>
        {
            new() { Id = 1, Nombre = "Carlos", ApellidoPaterno = "Lopez",  ApellidoMaterno = "Ruiz",   FechaNacimiento = new DateTime(2010, 1, 1) },
            new() { Id = 2, Nombre = "Ana",    ApellidoPaterno = "Perez",  ApellidoMaterno = "Torres", FechaNacimiento = new DateTime(2012, 5, 15) },
            new() { Id = 3, Nombre = "Luis",   ApellidoPaterno = "Ramirez",ApellidoMaterno = "Soto",   FechaNacimiento = new DateTime(2008, 9, 20) }
        };

        _repositorioMock
            .Setup(r => r.ObtenerConInscripcionesAsync())
            .ReturnsAsync(alumnosStub);

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarAlumnoDto>>(It.IsAny<IEnumerable<Alumno>>()))
            .Returns<IEnumerable<Alumno>>(lista => lista.Select(a => new BuscarAlumnoDto { Nombre = a.Nombre }));

        // ACT — buscar solo alumnos cuyo nombre contenga "ana"
        var resultado = await _servicio.ObtenerTodosAsync(nombre: "ana");

        // ASSERT — solo debe devolver a Ana
        resultado.Should().HaveCount(1);
        resultado.First().Nombre.Should().Be("Ana");
    }

    [Fact]
    public async Task ObtenerTodosAsync_SinResultados_RetornaListaVacia()
    {
        // ARRANGE — STUB: repositorio devuelve lista vacía
        _repositorioMock
            .Setup(r => r.ObtenerConInscripcionesAsync())
            .ReturnsAsync(new List<Alumno>());

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarAlumnoDto>>(It.IsAny<IEnumerable<Alumno>>()))
            .Returns(new List<BuscarAlumnoDto>());

        // ACT
        var resultado = await _servicio.ObtenerTodosAsync();

        // ASSERT
        resultado.Should().BeEmpty();
    }

    // ==========================================================================
    // PRUEBAS UNITARIAS — ObtenerPorSlugAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugExistente_RetornaAlumno()
    {
        // ARRANGE — STUB: el repositorio devuelve un alumno específico
        var alumnoStub = new Alumno
        {
            Id              = 1,
            Nombre          = "Carlos",
            ApellidoPaterno = "Lopez",
            ApellidoMaterno = "Ruiz",
            Slug            = "carlos-lopez",
            FechaNacimiento = new DateTime(2010, 1, 1)
        };

        var dtoEsperado = new BuscarAlumnoDto
        {
            Id     = 1,
            Nombre = "Carlos",
            Slug   = "carlos-lopez"
        };

        _repositorioMock
            .Setup(r => r.ObtenerPorSlugConInscripcionesAsync("carlos-lopez"))
            .ReturnsAsync(alumnoStub);

        _mapperMock
            .Setup(m => m.Map<BuscarAlumnoDto>(alumnoStub))
            .Returns(dtoEsperado);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("carlos-lopez");

        // ASSERT
        resultado.Should().NotBeNull();
        resultado!.Slug.Should().Be("carlos-lopez");
        resultado.Nombre.Should().Be("Carlos");
    }

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugInexistente_RetornaNull()
    {
        // ARRANGE — STUB: el repositorio devuelve null (no encontrado)
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugConInscripcionesAsync("no-existe"))
            .ReturnsAsync((Alumno?)null);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("no-existe");

        // ASSERT
        resultado.Should().BeNull();
    }

    // ==========================================================================
    // PRUEBAS UNITARIAS — CrearAsync  (uso de MOCK para verificar interacciones)
    // ==========================================================================

    [Fact]
    public async Task CrearAsync_DatosValidos_LlamaAgregarEnRepositorio()
    {
        // ARRANGE
        var dto = new CrearAlumnoDto
        {
            Nombre          = "Maria",
            ApellidoPaterno = "Garcia",
            ApellidoMaterno = "Mendez",
            FechaNacimiento = new DateTime(2011, 3, 10),
            NombreTutor     = "Rosa Mendez",
            TelefonoTutor   = "6671234567",
            EmailTutor      = "rosa@email.com",
            Enfermedades    = "No"
        };

        var alumnoMapeado = new Alumno
        {
            Nombre          = dto.Nombre,
            ApellidoPaterno = dto.ApellidoPaterno,
            Slug            = "maria-garcia"
        };

        var alumnoCreado = new Alumno { Id = 10, Slug = "maria-garcia" };

        var dtoResultado = new BuscarAlumnoDto { Id = 10, Nombre = "Maria", Slug = "maria-garcia" };

        // STUB: email y teléfono no existen
        _repositorioMock.Setup(r => r.ExistePorEmailAsync(dto.EmailTutor, null)).ReturnsAsync(false);
        _repositorioMock.Setup(r => r.ExistePorTelefonoAsync(dto.TelefonoTutor, null)).ReturnsAsync(false);

        // STUB: mapper convierte DTO → entidad
        _mapperMock.Setup(m => m.Map<Alumno>(dto)).Returns(alumnoMapeado);

        // STUB: repositorio devuelve el alumno recién creado
        _repositorioMock.Setup(r => r.AgregarAsync(alumnoMapeado)).ReturnsAsync(alumnoCreado);
        _repositorioMock.Setup(r => r.ObtenerPorSlugConInscripcionesAsync("maria-garcia")).ReturnsAsync(alumnoCreado);
        _mapperMock.Setup(m => m.Map<BuscarAlumnoDto>(alumnoCreado)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.CrearAsync(dto);

        // ASSERT — MOCK: verificar que AgregarAsync fue llamado exactamente 1 vez
        _repositorioMock.Verify(r => r.AgregarAsync(alumnoMapeado), Times.Once);
        resultado.Should().NotBeNull();
        resultado.Nombre.Should().Be("Maria");
    }

    [Fact]
    public async Task CrearAsync_EmailDuplicado_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: el email ya existe en la base de datos
        var dto = new CrearAlumnoDto
        {
            Nombre          = "Juan",
            ApellidoPaterno = "Torres",
            ApellidoMaterno = "Vega",
            FechaNacimiento = new DateTime(2012, 7, 5),
            NombreTutor     = "Pedro Torres",
            TelefonoTutor   = "6679876543",
            EmailTutor      = "existente@email.com",
            Enfermedades    = "No"
        };

        _repositorioMock
            .Setup(r => r.ExistePorEmailAsync(dto.EmailTutor, null))
            .ReturnsAsync(true); // email ya existe

        // ACT & ASSERT — debe lanzar excepción con el mensaje esperado
        await _servicio
            .Invoking(s => s.CrearAsync(dto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Ya existe un alumno con este email");

        // MOCK: verificar que AgregarAsync NUNCA fue llamado (se bloqueó antes)
        _repositorioMock.Verify(r => r.AgregarAsync(It.IsAny<Alumno>()), Times.Never);
    }

    [Fact]
    public async Task CrearAsync_TelefonoDuplicado_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: teléfono ya registrado
        var dto = new CrearAlumnoDto
        {
            Nombre          = "Laura",
            ApellidoPaterno = "Soto",
            ApellidoMaterno = "Rios",
            FechaNacimiento = new DateTime(2013, 2, 20),
            NombreTutor     = "Elena Rios",
            TelefonoTutor   = "6670000000",
            EmailTutor      = "nuevo@email.com",
            Enfermedades    = "No"
        };

        _repositorioMock.Setup(r => r.ExistePorEmailAsync(dto.EmailTutor, null)).ReturnsAsync(false);
        _repositorioMock.Setup(r => r.ExistePorTelefonoAsync(dto.TelefonoTutor, null)).ReturnsAsync(true); // teléfono duplicado

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.CrearAsync(dto))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Ya existe un alumno con este teléfono");

        _repositorioMock.Verify(r => r.AgregarAsync(It.IsAny<Alumno>()), Times.Never);
    }

    // ==========================================================================
    // PRUEBAS UNITARIAS — CambiarEstadoAsync
    // ==========================================================================

    [Fact]
    public async Task CambiarEstadoAsync_AlumnoExistente_ActualizaEstado()
    {
        // ARRANGE — STUB: repositorio devuelve el alumno
        var alumno = new Alumno { Id = 1, Slug = "carlos-lopez", Activo = true };

        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("carlos-lopez"))
            .ReturnsAsync(alumno);

        _repositorioMock
            .Setup(r => r.ActualizarAsync(alumno))
            .Returns(Task.CompletedTask);

        // ACT — desactivar al alumno
        await _servicio.CambiarEstadoAsync("carlos-lopez", false);

        // ASSERT — MOCK: verificar que ActualizarAsync fue llamado
        _repositorioMock.Verify(r => r.ActualizarAsync(It.Is<Alumno>(a => a.Activo == false)), Times.Once);
    }

    [Fact]
    public async Task CambiarEstadoAsync_AlumnoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: el repositorio no encuentra al alumno
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("no-existe"))
            .ReturnsAsync((Alumno?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.CambiarEstadoAsync("no-existe", false))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Alumno no encontrado");
    }

    // ==========================================================================
    // PRUEBAS UNITARIAS — EliminarPermanenteAsync
    // ==========================================================================

    [Fact]
    public async Task EliminarPermanenteAsync_AlumnoActivo_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: alumno existe pero está activo (no se puede eliminar)
        var alumno = new Alumno { Id = 1, Slug = "carlos-lopez", Activo = true };

        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("carlos-lopez"))
            .ReturnsAsync(alumno);

        // ACT & ASSERT — debe lanzar excepción al intentar eliminar un alumno activo
        await _servicio
            .Invoking(s => s.EliminarPermanenteAsync("carlos-lopez"))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Solo se pueden eliminar alumnos desactivados");

        // MOCK: verificar que EliminarAsync nunca fue llamado
        _repositorioMock.Verify(r => r.EliminarAsync(It.IsAny<Alumno>()), Times.Never);
    }
}
