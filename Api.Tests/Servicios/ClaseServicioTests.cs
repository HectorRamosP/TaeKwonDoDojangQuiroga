using Api.Comun.Modelos.Clases;
using Api.Entidades;
using Api.Repositorios;
using Api.Servicios;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Api.Tests.Servicios;

/// <summary>
/// Pruebas unitarias para ClaseServicio.
/// Se utilizan STUBS para simular datos y MOCKS para verificar interacciones con el repositorio.
/// </summary>
public class ClaseServicioTests
{
    private readonly Mock<IClaseRepositorio> _repositorioMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly ClaseServicio _servicio;

    public ClaseServicioTests()
    {
        _repositorioMock = new Mock<IClaseRepositorio>();
        _mapperMock      = new Mock<IMapper>();
        _servicio        = new ClaseServicio(_repositorioMock.Object, _mapperMock.Object);
    }

    // ==========================================================================
    // PRUEBAS — ObtenerTodasAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerTodasAsync_SinFiltros_RetornaTodasLasClases()
    {
        // ARRANGE — STUB: repositorio devuelve 2 clases
        var clasesStub = new List<Clase>
        {
            new() { Id = 1, Nombre = "Infantil Mañana", Activo = true,  Slug = "infantil-manana" },
            new() { Id = 2, Nombre = "Adultos Tarde",   Activo = false, Slug = "adultos-tarde"   }
        };

        var dtosEsperados = clasesStub.Select(c => new BuscarClaseDto
        {
            Id     = c.Id,
            Nombre = c.Nombre,
            Activo = c.Activo
        }).ToList();

        _repositorioMock
            .Setup(r => r.ObtenerConAlumnosAsync(null, null))
            .ReturnsAsync(clasesStub);

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarClaseDto>>(It.IsAny<IEnumerable<Clase>>()))
            .Returns(dtosEsperados);

        // ACT
        var resultado = await _servicio.ObtenerTodasAsync();

        // ASSERT
        resultado.Should().HaveCount(2);
    }

    [Fact]
    public async Task ObtenerTodasAsync_SinClases_RetornaListaVacia()
    {
        // ARRANGE — STUB: repositorio devuelve lista vacía
        _repositorioMock
            .Setup(r => r.ObtenerConAlumnosAsync(null, null))
            .ReturnsAsync(new List<Clase>());

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarClaseDto>>(It.IsAny<IEnumerable<Clase>>()))
            .Returns(new List<BuscarClaseDto>());

        // ACT
        var resultado = await _servicio.ObtenerTodasAsync();

        // ASSERT
        resultado.Should().BeEmpty();
    }

    // ==========================================================================
    // PRUEBAS — ObtenerPorSlugAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugExistente_RetornaClase()
    {
        // ARRANGE — STUB
        var claseStub  = new Clase { Id = 1, Nombre = "Infantil Mañana", Slug = "infantil-manana" };
        var dtoEsperado = new BuscarClaseDto { Id = 1, Nombre = "Infantil Mañana", Slug = "infantil-manana" };

        _repositorioMock
            .Setup(r => r.ObtenerPorSlugConAlumnosAsync("infantil-manana"))
            .ReturnsAsync(claseStub);

        _mapperMock
            .Setup(m => m.Map<BuscarClaseDto>(claseStub))
            .Returns(dtoEsperado);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("infantil-manana");

        // ASSERT
        resultado.Should().NotBeNull();
        resultado!.Slug.Should().Be("infantil-manana");
        resultado.Nombre.Should().Be("Infantil Mañana");
    }

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugInexistente_RetornaNull()
    {
        // ARRANGE — STUB: repositorio no encuentra la clase
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugConAlumnosAsync("no-existe"))
            .ReturnsAsync((Clase?)null);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("no-existe");

        // ASSERT
        resultado.Should().BeNull();
    }

    // ==========================================================================
    // PRUEBAS — CrearAsync
    // ==========================================================================

    [Fact]
    public async Task CrearAsync_DatosValidos_LlamaAgregarYRetornaClase()
    {
        // ARRANGE
        var dto = new CrearClaseDto
        {
            Nombre     = "Juvenil Tarde",
            Dias       = "Martes, Jueves",
            HoraInicio = new TimeSpan(16, 0, 0),
            HoraFin    = new TimeSpan(17, 30, 0),
            TipoClase  = "Juvenil"
        };

        var claseMapeada  = new Clase { Nombre = dto.Nombre, Slug = "juvenil-tarde" };
        var claseCreada   = new Clase { Id = 5, Nombre = dto.Nombre, Slug = "juvenil-tarde", Activo = true };
        var dtoResultado  = new BuscarClaseDto { Id = 5, Nombre = dto.Nombre, Slug = "juvenil-tarde", Activo = true };

        _mapperMock.Setup(m => m.Map<Clase>(dto)).Returns(claseMapeada);
        _repositorioMock.Setup(r => r.AgregarAsync(claseMapeada)).ReturnsAsync(claseCreada);
        _repositorioMock.Setup(r => r.ObtenerPorSlugConAlumnosAsync("juvenil-tarde")).ReturnsAsync(claseCreada);
        _mapperMock.Setup(m => m.Map<BuscarClaseDto>(claseCreada)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.CrearAsync(dto);

        // ASSERT — MOCK: verificar que AgregarAsync fue llamado 1 vez
        _repositorioMock.Verify(r => r.AgregarAsync(claseMapeada), Times.Once);
        resultado.Should().NotBeNull();
        resultado.Nombre.Should().Be("Juvenil Tarde");
        resultado.Activo.Should().BeTrue();
    }

    // ==========================================================================
    // PRUEBAS — ActualizarAsync
    // ==========================================================================

    [Fact]
    public async Task ActualizarAsync_ClaseExistente_LlamaActualizarYRetornaClase()
    {
        // ARRANGE
        var claseExistente = new Clase { Id = 1, Nombre = "Infantil Mañana", Slug = "infantil-manana" };
        var dto = new ModificarClaseDto
        {
            Slug       = "infantil-manana",
            Nombre     = "Infantil Mañana Actualizada",
            Dias       = "Lunes, Miércoles",
            HoraInicio = new TimeSpan(9, 0, 0),
            HoraFin    = new TimeSpan(10, 0, 0),
            TipoClase  = "Infantil",
            Activo     = true
        };

        var claseActualizada = new Clase { Id = 1, Nombre = "Infantil Mañana Actualizada", Slug = "infantil-manana" };
        var dtoResultado     = new BuscarClaseDto { Id = 1, Nombre = "Infantil Mañana Actualizada", Slug = "infantil-manana" };

        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("infantil-manana")).ReturnsAsync(claseExistente);
        _repositorioMock.Setup(r => r.ActualizarAsync(claseExistente)).Returns(Task.CompletedTask);
        _repositorioMock.Setup(r => r.ObtenerPorSlugConAlumnosAsync("infantil-manana")).ReturnsAsync(claseActualizada);
        _mapperMock.Setup(m => m.Map<BuscarClaseDto>(claseActualizada)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.ActualizarAsync("infantil-manana", dto);

        // ASSERT — MOCK: verificar que ActualizarAsync fue llamado
        _repositorioMock.Verify(r => r.ActualizarAsync(claseExistente), Times.Once);
        resultado.Nombre.Should().Be("Infantil Mañana Actualizada");
    }

    [Fact]
    public async Task ActualizarAsync_ClaseInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: la clase no existe
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("no-existe"))
            .ReturnsAsync((Clase?)null);

        var dto = new ModificarClaseDto { Slug = "no-existe", Nombre = "X", Dias = "X", TipoClase = "X" };

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.ActualizarAsync("no-existe", dto))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Clase no encontrada");
    }

    // ==========================================================================
    // PRUEBAS — EliminarAsync
    // ==========================================================================

    [Fact]
    public async Task EliminarAsync_ClaseConAlumnosActivos_LanzaInvalidOperationException()
    {
        // ARRANGE — STUB: la clase tiene alumnos activos
        _repositorioMock
            .Setup(r => r.TieneAlumnosActivosAsync("infantil-manana"))
            .ReturnsAsync(true);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.EliminarAsync("infantil-manana"))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("No se puede eliminar la clase porque tiene alumnos asignados");

        // MOCK: verificar que EliminarAsync nunca fue llamado
        _repositorioMock.Verify(r => r.EliminarAsync(It.IsAny<Clase>()), Times.Never);
    }

    [Fact]
    public async Task EliminarAsync_ClaseSinAlumnos_EliminaCorrectamente()
    {
        // ARRANGE — STUB: sin alumnos activos, clase existe
        var clase = new Clase { Id = 2, Slug = "adultos-tarde" };

        _repositorioMock.Setup(r => r.TieneAlumnosActivosAsync("adultos-tarde")).ReturnsAsync(false);
        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("adultos-tarde")).ReturnsAsync(clase);
        _repositorioMock.Setup(r => r.EliminarAsync(clase)).Returns(Task.CompletedTask);

        // ACT
        await _servicio.EliminarAsync("adultos-tarde");

        // ASSERT — MOCK: verificar que EliminarAsync fue llamado exactamente 1 vez
        _repositorioMock.Verify(r => r.EliminarAsync(clase), Times.Once);
    }

    [Fact]
    public async Task EliminarAsync_ClaseInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: sin alumnos pero la clase no existe
        _repositorioMock.Setup(r => r.TieneAlumnosActivosAsync("no-existe")).ReturnsAsync(false);
        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("no-existe")).ReturnsAsync((Clase?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.EliminarAsync("no-existe"))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Clase no encontrada");
    }
}
