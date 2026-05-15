using Api.Comun.Modelos.Conceptos;
using Api.Entidades;
using Api.Repositorios;
using Api.Servicios;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Api.Tests.Servicios;

/// <summary>
/// Pruebas unitarias para ConceptoServicio.
/// Se utilizan STUBS para simular datos y MOCKS para verificar interacciones con el repositorio.
/// </summary>
public class ConceptoServicioTests
{
    private readonly Mock<IConceptoRepositorio> _repositorioMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly ConceptoServicio _servicio;

    public ConceptoServicioTests()
    {
        _repositorioMock = new Mock<IConceptoRepositorio>();
        _mapperMock      = new Mock<IMapper>();
        _servicio        = new ConceptoServicio(_repositorioMock.Object, _mapperMock.Object);
    }

    // ==========================================================================
    // PRUEBAS — ObtenerTodosAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerTodosAsync_SinFiltros_RetornaTodosLosConceptos()
    {
        // ARRANGE — STUB
        var conceptosStub = new List<Concepto>
        {
            new() { Id = 1, Nombre = "Mensualidad Infantil", TipoConcepto = "Mensualidad", Activo = true  },
            new() { Id = 2, Nombre = "Clase Individual",     TipoConcepto = "Individual",  Activo = true  },
            new() { Id = 3, Nombre = "Examen de Cinta",      TipoConcepto = "Examen",      Activo = false }
        };

        var dtosEsperados = conceptosStub.Select(c => new BuscarConceptoDto
        {
            Id     = c.Id,
            Nombre = c.Nombre,
            Activo = c.Activo
        }).ToList();

        _repositorioMock
            .Setup(r => r.ObtenerOrdenadasAsync(null, null))
            .ReturnsAsync(conceptosStub);

        _mapperMock
            .Setup(m => m.Map<IEnumerable<BuscarConceptoDto>>(It.IsAny<IEnumerable<Concepto>>()))
            .Returns(dtosEsperados);

        // ACT
        var resultado = await _servicio.ObtenerTodosAsync();

        // ASSERT
        resultado.Should().HaveCount(3);
    }

    // ==========================================================================
    // PRUEBAS — ObtenerPorSlugAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugExistente_RetornaConcepto()
    {
        // ARRANGE — STUB
        var conceptoStub = new Concepto { Id = 1, Nombre = "Mensualidad Infantil", Slug = "mensualidad-infantil" };
        var dtoEsperado  = new BuscarConceptoDto { Id = 1, Nombre = "Mensualidad Infantil", Slug = "mensualidad-infantil" };

        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("mensualidad-infantil")).ReturnsAsync(conceptoStub);
        _mapperMock.Setup(m => m.Map<BuscarConceptoDto>(conceptoStub)).Returns(dtoEsperado);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("mensualidad-infantil");

        // ASSERT
        resultado.Should().NotBeNull();
        resultado!.Slug.Should().Be("mensualidad-infantil");
    }

    [Fact]
    public async Task ObtenerPorSlugAsync_SlugInexistente_RetornaNull()
    {
        // ARRANGE — STUB: no encontrado
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("no-existe"))
            .ReturnsAsync((Concepto?)null);

        // ACT
        var resultado = await _servicio.ObtenerPorSlugAsync("no-existe");

        // ASSERT
        resultado.Should().BeNull();
    }

    // ==========================================================================
    // PRUEBAS — CrearAsync
    // ==========================================================================

    [Fact]
    public async Task CrearAsync_DatosValidos_LlamaAgregarYRetornaConcepto()
    {
        // ARRANGE
        var dto = new CrearConceptoDto
        {
            Nombre       = "Mensualidad Adultos",
            Precio       = 500,
            TipoConcepto = "Mensualidad"
        };

        var conceptoMapeado = new Concepto { Nombre = dto.Nombre };
        var conceptoCreado  = new Concepto { Id = 10, Nombre = dto.Nombre, Activo = true };
        var dtoResultado    = new BuscarConceptoDto { Id = 10, Nombre = dto.Nombre, Activo = true };

        _mapperMock.Setup(m => m.Map<Concepto>(dto)).Returns(conceptoMapeado);
        _repositorioMock.Setup(r => r.AgregarAsync(conceptoMapeado)).ReturnsAsync(conceptoCreado);
        _mapperMock.Setup(m => m.Map<BuscarConceptoDto>(conceptoCreado)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.CrearAsync(dto);

        // ASSERT — MOCK: verificar que AgregarAsync fue llamado 1 vez
        _repositorioMock.Verify(r => r.AgregarAsync(conceptoMapeado), Times.Once);
        resultado.Should().NotBeNull();
        resultado.Nombre.Should().Be("Mensualidad Adultos");
        resultado.Activo.Should().BeTrue();
    }

    // ==========================================================================
    // PRUEBAS — ActualizarAsync
    // ==========================================================================

    [Fact]
    public async Task ActualizarAsync_ConceptoExistente_ActualizaCorrectamente()
    {
        // ARRANGE
        var conceptoExistente = new Concepto { Id = 1, Nombre = "Mensualidad Infantil", Slug = "mensualidad-infantil" };
        var dto = new ModificarConceptoDto
        {
            Slug         = "mensualidad-infantil",
            Nombre       = "Mensualidad Infantil Actualizada",
            Precio       = 450,
            TipoConcepto = "Mensualidad"
        };

        var dtoResultado = new BuscarConceptoDto { Id = 1, Nombre = "Mensualidad Infantil Actualizada" };

        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("mensualidad-infantil")).ReturnsAsync(conceptoExistente);
        _repositorioMock.Setup(r => r.ActualizarAsync(conceptoExistente)).Returns(Task.CompletedTask);
        _mapperMock.Setup(m => m.Map<BuscarConceptoDto>(conceptoExistente)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.ActualizarAsync("mensualidad-infantil", dto);

        // ASSERT — MOCK: verificar que ActualizarAsync fue llamado
        _repositorioMock.Verify(r => r.ActualizarAsync(conceptoExistente), Times.Once);
        resultado.Nombre.Should().Be("Mensualidad Infantil Actualizada");
    }

    [Fact]
    public async Task ActualizarAsync_ConceptoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: concepto no encontrado
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("no-existe"))
            .ReturnsAsync((Concepto?)null);

        var dto = new ModificarConceptoDto { Slug = "no-existe", Nombre = "X", TipoConcepto = "X" };

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.ActualizarAsync("no-existe", dto))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Concepto no encontrado");
    }

    // ==========================================================================
    // PRUEBAS — DesactivarAsync
    // ==========================================================================

    [Fact]
    public async Task DesactivarAsync_ConceptoExistente_DesactivaCorrectamente()
    {
        // ARRANGE — STUB: concepto activo
        var concepto = new Concepto { Id = 1, Slug = "mensualidad-infantil", Activo = true };

        _repositorioMock.Setup(r => r.ObtenerPorSlugAsync("mensualidad-infantil")).ReturnsAsync(concepto);
        _repositorioMock.Setup(r => r.ActualizarAsync(concepto)).Returns(Task.CompletedTask);

        // ACT
        await _servicio.DesactivarAsync("mensualidad-infantil");

        // ASSERT — MOCK: verificar que ActualizarAsync fue llamado con el concepto desactivado
        _repositorioMock.Verify(
            r => r.ActualizarAsync(It.Is<Concepto>(c => c.Activo == false)),
            Times.Once);
    }

    [Fact]
    public async Task DesactivarAsync_ConceptoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: no encontrado
        _repositorioMock
            .Setup(r => r.ObtenerPorSlugAsync("no-existe"))
            .ReturnsAsync((Concepto?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.DesactivarAsync("no-existe"))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Concepto no encontrado");
    }
}
