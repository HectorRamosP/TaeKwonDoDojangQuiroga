using AutoMapper;
using Api.Comun.Modelos.Alumnos;
using Api.Entidades;

namespace Api.Perfiles;

public class AlumnoProfile : Profile
{
    public AlumnoProfile()
    {
        CreateMap<Alumno, BuscarAlumnoDto>()
            .ForMember(dest => dest.Edad, opt => opt.MapFrom(src => CalcularEdad(src.FechaNacimiento)))
            .ForMember(dest => dest.NombreCompleto, opt => opt.MapFrom(src => $"{src.Nombre} {src.ApellidoPaterno} {src.ApellidoMaterno}"))
            .ForMember(dest => dest.CintaActualNombre, opt => opt.MapFrom(src => src.CintaActual != null ? src.CintaActual.Nombre : null))
            .ForMember(dest => dest.CintaActualColor, opt => opt.MapFrom(src => src.CintaActual != null ? src.CintaActual.ColorHex : null))
            .ForMember(dest => dest.CintaActualOrden, opt => opt.MapFrom(src => src.CintaActual != null ? (int?)src.CintaActual.Orden : null))
            .ForMember(dest => dest.ClaseNombre, opt => opt.MapFrom(src => src.Clase != null ? src.Clase.Nombre : null))
            .ForMember(dest => dest.ClaseHorario, opt => opt.MapFrom(src => src.Clase != null ? $"{src.Clase.HoraInicio:hh\\:mm} - {src.Clase.HoraFin:hh\\:mm}" : null))
            .ForMember(dest => dest.ConceptoMensualidadNombre, opt => opt.MapFrom(src => src.ConceptoMensualidad != null ? src.ConceptoMensualidad.Nombre : null))
            .ForMember(dest => dest.ConceptoMensualidadMonto, opt => opt.MapFrom(src => src.ConceptoMensualidad != null ? (decimal?)src.ConceptoMensualidad.Precio : null))
            .ForMember(dest => dest.DiasParaVencer, opt => opt.MapFrom(src => 
                src.AlumnoInscripciones.Where(i => i.Activa && i.FechaFin >= DateTime.Today).OrderBy(i => i.FechaFin).Select(i => (int?)(i.FechaFin.Date - DateTime.Today).Days).FirstOrDefault()
            ));

        CreateMap<CrearAlumnoDto, Alumno>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Slug, opt => opt.Ignore())
            .ForMember(dest => dest.FechaInscripcion, opt => opt.MapFrom(_ => DateTime.Now))
            .ForMember(dest => dest.Activo, opt => opt.MapFrom(_ => true))
            .ForMember(dest => dest.CintaActual, opt => opt.Ignore())
            .ForMember(dest => dest.Clase, opt => opt.Ignore())
            .ForMember(dest => dest.ConceptoMensualidad, opt => opt.Ignore())
            .ForMember(dest => dest.Asistencias, opt => opt.Ignore())
            .ForMember(dest => dest.Pagos, opt => opt.Ignore())
            .ForMember(dest => dest.AlumnoInscripciones, opt => opt.Ignore());

        CreateMap<ModificarAlumnoDto, Alumno>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FechaInscripcion, opt => opt.Ignore())
            .ForMember(dest => dest.CintaActual, opt => opt.Ignore())
            .ForMember(dest => dest.Clase, opt => opt.Ignore())
            .ForMember(dest => dest.ConceptoMensualidad, opt => opt.Ignore())
            .ForMember(dest => dest.Asistencias, opt => opt.Ignore())
            .ForMember(dest => dest.Pagos, opt => opt.Ignore())
            .ForMember(dest => dest.AlumnoInscripciones, opt => opt.Ignore());
    }

    private static int CalcularEdad(DateTime fechaNacimiento)
    {
        var hoy = DateTime.Today;
        var edad = hoy.Year - fechaNacimiento.Year;
        if (fechaNacimiento.Date > hoy.AddYears(-edad)) edad--;
        return edad;
    }
}
