using Api.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Persistencia.Configuraciones;

public class AsistenciaConfiguracion : IEntityTypeConfiguration<Asistencia>
{
    public void Configure(EntityTypeBuilder<Asistencia> builder)
    {
        builder.ToTable("Asistencias");
        builder.HasKey(a => a.Id);

        // Índice único para evitar duplicados (un alumno solo puede tener una asistencia por clase y fecha)
        builder.HasIndex(a => new { a.AlumnoId, a.ClaseId, a.Fecha })
            .IsUnique();

        builder.Property(a => a.Fecha)
            .IsRequired();

        builder.Property(a => a.Presente)
            .IsRequired();

        builder.Property(a => a.Justificada)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.Observacion)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.HasOne(a => a.Alumno)
            .WithMany(al => al.Asistencias)
            .HasForeignKey(a => a.AlumnoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Clase)
            .WithMany(c => c.Asistencias)
            .HasForeignKey(a => a.ClaseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.UsuarioRegistro)
            .WithMany(u => u.AsistenciasRegistradas)
            .HasForeignKey(a => a.UsuarioRegistroId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
