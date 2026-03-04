using Api.Comun.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Comun.Modelos;

namespace Api.Servicios;

public class JwtTokenServicio : ITokenIdentidadServicio
{
    private readonly IdentidadAjuste _identidadAjustes;

    public JwtTokenServicio(IdentidadAjuste identidadAjustes)
    {
        _identidadAjustes = identidadAjustes;
    }

    public string Generar(ReclamosTokenIdentidad reclamos)
    {
        if (string.IsNullOrWhiteSpace(_identidadAjustes.Secreto))
            throw new InvalidOperationException("El secreto JWT no está configurado.");
        
        var llave = Encoding.ASCII.GetBytes(_identidadAjustes.Secreto);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // Token persistente (opción "recordarme"): 30 días. Sesión normal: 1 día.
            Expires = reclamos.EsPersistente
                ? DateTime.UtcNow.AddDays(30)
                : DateTime.UtcNow.AddDays(1),
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.IsPersistent, reclamos.EsPersistente.ToString()),
                new Claim(ClaimTypes.SerialNumber, reclamos.EstampaSeguridad),
                new Claim(nameof(ReclamosTokenIdentidad.FechaTicks), reclamos.FechaTicks.ToString()),
            }),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(llave),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenManejador = new JwtSecurityTokenHandler();

        var token = tokenManejador.CreateToken(tokenDescriptor);

        return tokenManejador.WriteToken(token);
    }

    public ReclamosTokenIdentidad? ObtenerReclamos(IEnumerable<Claim> reclamos)
    {
        try
        {
            // empresaId se extrae pero no se usa actualmente; el _ descarta el resultado de TryParse
            _ = int.TryParse(reclamos.SingleOrDefault(c => c.Type == ClaimTypes.GroupSid)?.Value, out int empresaId);

            return new ReclamosTokenIdentidad
            {
                EsPersistente = reclamos.Any(c => c.Type == ClaimTypes.IsPersistent && c.Value == true.ToString()),
                // Single() lanza excepción si el claim no existe; es intencional porque
                // un JWT válido siempre debe contener SerialNumber y FechaTicks
                EstampaSeguridad = reclamos.Single(c => c.Type == ClaimTypes.SerialNumber).Value,
                FechaTicks = long.Parse(reclamos.Single(c => c.Type == nameof(ReclamosTokenIdentidad.FechaTicks)).Value)
            };
        }
        catch
        {
            // Si el token está malformado o le falta algún claim obligatorio, retorna null
            return null;
        }
    }

    public async Task<bool> ValidarAsync(ReclamosTokenIdentidad reclamos, CancellationToken cancelacionToken = default)
    {
        if (reclamos == null)
        {
            return false;
        }

        var fechaLimite = DateTime.Now.AddMinutes(-_identidadAjustes.Expiracion);

        // Validación de dos condiciones:
        // 1. EstampaSeguridad debe coincidir (permite invalidar todos los tokens cambiando el valor en config)
        // 2. Si no es persistente, la fecha del token debe ser más reciente que el límite de expiración
        var correcto = reclamos.EstampaSeguridad == _identidadAjustes.EstampaSeguridad &&
                       (reclamos.EsPersistente || reclamos.Fecha > fechaLimite);

        return await Task.FromResult(correcto);
    }
}