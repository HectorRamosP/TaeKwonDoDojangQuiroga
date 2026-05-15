using Api.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Persistencia.Configuraciones;

public class TipoConceptoConfiguracion : IEntityTypeConfiguration<TipoConcepto>
{
    public void Configure(EntityTypeBuilder<TipoConcepto> builder)
    {
        builder.ToTable("TiposConcepto");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Descripcion)
            .HasMaxLength(300);

        builder.Property(t => t.Orden)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(t => t.Activo)
            .IsRequired();

        // El nombre debe ser único en toda la tabla
        builder.HasIndex(t => t.Nombre)
            .IsUnique()
            .HasDatabaseName("IX_TiposConcepto_Nombre");

        // Seed: los 5 tipos originales hardcodeados en el código
        builder.HasData(
            new TipoConcepto { Id = 1, Nombre = "Mensualidad",  Descripcion = "Pago mensual de membresía",         Orden = 1, Activo = true },
            new TipoConcepto { Id = 2, Nombre = "Inscripcion",  Descripcion = "Pago de inscripción inicial",        Orden = 2, Activo = true },
            new TipoConcepto { Id = 3, Nombre = "Examen",       Descripcion = "Pago para examen de grado (cinta)", Orden = 3, Activo = true },
            new TipoConcepto { Id = 4, Nombre = "Uniforme",     Descripcion = "Compra de uniforme (dobok)",         Orden = 4, Activo = true },
            new TipoConcepto { Id = 5, Nombre = "Otro",         Descripcion = "Concepto de cobro genérico",         Orden = 5, Activo = true }
        );
    }
}
