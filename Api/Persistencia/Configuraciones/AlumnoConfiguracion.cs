using Api.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Persistencia.Configuraciones;

public class AlumnoConfiguracion : IEntityTypeConfiguration<Alumno>
{
    public void Configure(EntityTypeBuilder<Alumno> builder)
    {
        builder.ToTable("Alumnos");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.ApellidoPaterno)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.ApellidoMaterno)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Curp)
            .HasMaxLength(18);

        builder.Property(a => a.Enfermedades)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.NombreTutor)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.TelefonoTutor)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.EmailTutor)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Slug)
            .HasMaxLength(200);

        // Índices para mejorar performance
        builder.HasIndex(a => a.Slug)
            .IsUnique()
            .HasDatabaseName("IX_Alumnos_Slug");

        builder.HasIndex(a => a.Curp)
            .IsUnique()
            .HasFilter("[Curp] IS NOT NULL")
            .HasDatabaseName("IX_Alumnos_Curp");

        builder.HasIndex(a => a.Activo)
            .HasDatabaseName("IX_Alumnos_Activo");

        builder.HasIndex(a => a.EmailTutor)
            .HasDatabaseName("IX_Alumnos_EmailTutor");

        builder.HasIndex(a => a.CintaActualId)
            .HasDatabaseName("IX_Alumnos_CintaActualId");

        builder.HasIndex(a => a.ClaseId)
            .HasDatabaseName("IX_Alumnos_ClaseId");

        builder.HasIndex(a => new { a.Activo, a.ClaseId })
            .HasDatabaseName("IX_Alumnos_Activo_ClaseId");

        builder.HasOne(a => a.CintaActual)
            .WithMany(c => c.Alumnos)
            .HasForeignKey(a => a.CintaActualId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.Clase)
            .WithMany(c => c.Alumnos)
            .HasForeignKey(a => a.ClaseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(a => a.ConceptoMensualidad)
            .WithMany()
            .HasForeignKey(a => a.ConceptoMensualidadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(a => a.AlumnoInscripciones)
            .WithOne(ai => ai.Alumno)
            .HasForeignKey(ai => ai.AlumnoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(a => a.Pagos)
            .WithOne(p => p.Alumno)
            .HasForeignKey(p => p.AlumnoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Asistencias)
            .WithOne(asist => asist.Alumno)
            .HasForeignKey(asist => asist.AlumnoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
