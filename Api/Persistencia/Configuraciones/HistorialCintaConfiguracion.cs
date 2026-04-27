using Api.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Persistencia.Configuraciones;

public class HistorialCintaConfiguracion : IEntityTypeConfiguration<HistorialCinta>
{
    public void Configure(EntityTypeBuilder<HistorialCinta> builder)
    {
        builder.ToTable("HistorialCintas");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.FechaObtencion)
            .IsRequired();

        builder.Property(h => h.Observaciones)
            .HasMaxLength(500);

        // Índice para consultas por alumno ordenadas por fecha
        builder.HasIndex(h => new { h.AlumnoId, h.FechaObtencion })
            .HasDatabaseName("IX_HistorialCintas_AlumnoId_FechaObtencion");

        builder.HasOne(h => h.Alumno)
            .WithMany(a => a.HistorialCintas)
            .HasForeignKey(h => h.AlumnoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(h => h.Cinta)
            .WithMany()
            .HasForeignKey(h => h.CintaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
