using Api.Comun.Modelos.Pagos;
using Api.Entidades;
using Api.Repositorios;
using Api.Servicios;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Api.Tests.Servicios;

/// <summary>
/// Pruebas unitarias para PagoServicio.
/// Se utilizan STUBS para simular datos de repositorios cruzados (alumno, concepto, pago)
/// y MOCKS para verificar que los métodos del repositorio se invocan correctamente.
/// </summary>
public class PagoServicioTests
{
    private readonly Mock<IPagoRepositorio>     _pagoRepoMock;
    private readonly Mock<IAlumnoRepositorio>   _alumnoRepoMock;
    private readonly Mock<IConceptoRepositorio> _conceptoRepoMock;
    private readonly Mock<IMapper>              _mapperMock;
    private readonly PagoServicio               _servicio;

    public PagoServicioTests()
    {
        _pagoRepoMock     = new Mock<IPagoRepositorio>();
        _alumnoRepoMock   = new Mock<IAlumnoRepositorio>();
        _conceptoRepoMock = new Mock<IConceptoRepositorio>();
        _mapperMock       = new Mock<IMapper>();

        _servicio = new PagoServicio(
            _pagoRepoMock.Object,
            _alumnoRepoMock.Object,
            _conceptoRepoMock.Object,
            _mapperMock.Object);
    }

    // ==========================================================================
    // PRUEBAS — ObtenerPorIdAsync
    // ==========================================================================

    [Fact]
    public async Task ObtenerPorIdAsync_IdExistente_RetornaPago()
    {
        // ARRANGE — STUB
        var pagoStub    = new Pago { Id = 1, Monto = 500, Estado = "Confirmado" };
        var dtoEsperado = new BuscarPagoDto { Id = 1, Monto = 500, Estado = "Confirmado" };

        _pagoRepoMock.Setup(r => r.ObtenerPorIdConRelacionesAsync(1)).ReturnsAsync(pagoStub);
        _mapperMock.Setup(m => m.Map<BuscarPagoDto>(pagoStub)).Returns(dtoEsperado);

        // ACT
        var resultado = await _servicio.ObtenerPorIdAsync(1);

        // ASSERT
        resultado.Should().NotBeNull();
        resultado!.Id.Should().Be(1);
        resultado.Estado.Should().Be("Confirmado");
    }

    [Fact]
    public async Task ObtenerPorIdAsync_IdInexistente_RetornaNull()
    {
        // ARRANGE — STUB: pago no encontrado
        _pagoRepoMock
            .Setup(r => r.ObtenerPorIdConRelacionesAsync(999))
            .ReturnsAsync((Pago?)null);

        // ACT
        var resultado = await _servicio.ObtenerPorIdAsync(999);

        // ASSERT
        resultado.Should().BeNull();
    }

    // ==========================================================================
    // PRUEBAS — CrearAsync
    // ==========================================================================

    [Fact]
    public async Task CrearAsync_AlumnoYConceptoExisten_CreaElPago()
    {
        // ARRANGE
        var dto = new CrearPagoDto
        {
            AlumnoId   = 1,
            ConceptoId = 2,
            Monto      = 500,
            MetodoPago = "Efectivo"
        };

        var alumnoStub   = new Alumno  { Id = 1, Nombre = "Carlos" };
        var conceptoStub = new Concepto{ Id = 2, Nombre = "Mensualidad Infantil" };
        var pagoMapeado  = new Pago    { AlumnoId = 1, ConceptoId = 2, Monto = 500 };
        var pagoCreado   = new Pago    { Id = 10, AlumnoId = 1, ConceptoId = 2, Monto = 500, Estado = "Confirmado" };
        var dtoResultado = new BuscarPagoDto { Id = 10, Monto = 500, Estado = "Confirmado" };

        // STUB: alumno y concepto existen
        _alumnoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(alumnoStub);
        _conceptoRepoMock.Setup(r => r.ObtenerPorIdAsync(2)).ReturnsAsync(conceptoStub);

        _mapperMock.Setup(m => m.Map<Pago>(dto)).Returns(pagoMapeado);
        _pagoRepoMock.Setup(r => r.AgregarAsync(pagoMapeado)).ReturnsAsync(pagoCreado);
        _pagoRepoMock.Setup(r => r.ObtenerPorIdConRelacionesAsync(10)).ReturnsAsync(pagoCreado);
        _mapperMock.Setup(m => m.Map<BuscarPagoDto>(pagoCreado)).Returns(dtoResultado);

        // ACT
        var resultado = await _servicio.CrearAsync(dto, usuarioRegistroId: 1);

        // ASSERT — MOCK: verificar que AgregarAsync fue llamado 1 vez
        _pagoRepoMock.Verify(r => r.AgregarAsync(pagoMapeado), Times.Once);
        resultado.Should().NotBeNull();
        resultado.Estado.Should().Be("Confirmado");
        resultado.Monto.Should().Be(500);
    }

    [Fact]
    public async Task CrearAsync_AlumnoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: alumno no existe
        var dto = new CrearPagoDto { AlumnoId = 99, ConceptoId = 1, Monto = 100, MetodoPago = "Efectivo" };

        _alumnoRepoMock
            .Setup(r => r.ObtenerPorIdAsync(99))
            .ReturnsAsync((Alumno?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.CrearAsync(dto, 1))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("El alumno especificado no existe");

        // MOCK: verificar que AgregarAsync NUNCA fue llamado
        _pagoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Pago>()), Times.Never);
    }

    [Fact]
    public async Task CrearAsync_ConceptoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: alumno existe pero concepto no
        var dto = new CrearPagoDto { AlumnoId = 1, ConceptoId = 99, Monto = 100, MetodoPago = "Efectivo" };

        _alumnoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(new Alumno { Id = 1 });
        _conceptoRepoMock
            .Setup(r => r.ObtenerPorIdAsync(99))
            .ReturnsAsync((Concepto?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.CrearAsync(dto, 1))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("El concepto especificado no existe");

        _pagoRepoMock.Verify(r => r.AgregarAsync(It.IsAny<Pago>()), Times.Never);
    }

    // ==========================================================================
    // PRUEBAS — EliminarAsync
    // ==========================================================================

    [Fact]
    public async Task EliminarAsync_PagoExistente_EliminaCorrectamente()
    {
        // ARRANGE — STUB
        var pago = new Pago { Id = 1, Monto = 500 };

        _pagoRepoMock.Setup(r => r.ObtenerPorIdAsync(1)).ReturnsAsync(pago);
        _pagoRepoMock.Setup(r => r.EliminarAsync(pago)).Returns(Task.CompletedTask);

        // ACT
        await _servicio.EliminarAsync(1);

        // ASSERT — MOCK: verificar que EliminarAsync fue llamado 1 vez
        _pagoRepoMock.Verify(r => r.EliminarAsync(pago), Times.Once);
    }

    [Fact]
    public async Task EliminarAsync_PagoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: pago no encontrado
        _pagoRepoMock
            .Setup(r => r.ObtenerPorIdAsync(999))
            .ReturnsAsync((Pago?)null);

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.EliminarAsync(999))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Pago no encontrado");
    }

    // ==========================================================================
    // PRUEBAS — ActualizarAsync
    // ==========================================================================

    [Fact]
    public async Task ActualizarAsync_PagoInexistente_LanzaKeyNotFoundException()
    {
        // ARRANGE — STUB: pago no encontrado
        _pagoRepoMock
            .Setup(r => r.ObtenerPorIdAsync(999))
            .ReturnsAsync((Pago?)null);

        var dto = new ModificarPagoDto { AlumnoId = 1, ConceptoId = 1, Monto = 100, MetodoPago = "Efectivo" };

        // ACT & ASSERT
        await _servicio
            .Invoking(s => s.ActualizarAsync(999, dto))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Pago no encontrado");
    }
}
