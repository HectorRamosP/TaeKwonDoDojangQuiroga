using AutoMapper;
using Api.Comun.Modelos.TiposConcepto;
using Api.Entidades;

namespace Api.Perfiles;

public class TipoConceptoProfile : Profile
{
    public TipoConceptoProfile()
    {
        CreateMap<TipoConcepto, BuscarTipoConceptoDto>();

        CreateMap<CrearTipoConceptoDto, TipoConcepto>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Activo, opt => opt.Ignore());

        CreateMap<ModificarTipoConceptoDto, TipoConcepto>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}
