using Api.Comun.Interfaces;
using Api.Comun.Modelos;
using Api.Persistencia;
using Api.Servicios;
using Api.Repositorios;
using Api.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Asp.Versioning;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

var builder = WebApplication.CreateBuilder(args);

var identidadAjustes = builder.Configuration.GetSection("IdentidadAjustes").Get<IdentidadAjuste>();
if (identidadAjustes == null)
{
    throw new Exception("Falta la configuración para IdentidadAjustes.");
}

builder.Services.AddSingleton(identidadAjustes);

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.AddControllers();

builder.Services.AddDbContext<AplicacionBdContexto>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions
            .EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null)
            .CommandTimeout(30)));

builder.Services.AddScoped<IAplicacionBdContexto, AplicacionBdContexto>();

builder.Services.AddScoped(typeof(IRepositorioGenerico<>), typeof(RepositorioGenerico<>));
builder.Services.AddScoped<IAlumnoRepositorio, AlumnoRepositorio>();
builder.Services.AddScoped<IAsistenciaRepositorio, AsistenciaRepositorio>();
builder.Services.AddScoped<ICintaRepositorio, CintaRepositorio>();
builder.Services.AddScoped<IClaseRepositorio, ClaseRepositorio>();
builder.Services.AddScoped<IConceptoRepositorio, ConceptoRepositorio>();
builder.Services.AddScoped<IPagoRepositorio, PagoRepositorio>();
builder.Services.AddScoped<IUsuarioRepositorio, UsuarioRepositorio>();

builder.Services.AddScoped<IAlumnoServicio, AlumnoServicio>();
builder.Services.AddScoped<IAsistenciaServicio, AsistenciaServicio>();
builder.Services.AddScoped<ICintaServicio, CintaServicio>();
builder.Services.AddScoped<IClaseServicio, ClaseServicio>();
builder.Services.AddScoped<IConceptoServicio, ConceptoServicio>();
builder.Services.AddScoped<IPagoServicio, PagoServicio>();
builder.Services.AddScoped<IUsuarioServicio, UsuarioServicio>();
builder.Services.AddScoped<IReporteServicio, ReporteServicio>();
builder.Services.AddTransient<IHasherServicio, Sha512HasherServicio>();
builder.Services.AddTransient<ITokenIdentidadServicio, JwtTokenServicio>();
builder.Services.AddScoped<IUsuariosSesionServicio, UsuarioSesionServicioSimple>();

builder.Services.AddAutoMapper(typeof(Program).Assembly);

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"));
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Taekwondo Dojang Quiroga API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Inserte el token {Bearer JWT_TOKEN} en el encabezado.",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("PoliticasCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
              .WithHeaders("Authorization", "Content-Type", "Accept", "X-Api-Version")
              .WithExposedHeaders("Authorization")
              .SetIsOriginAllowedToAllowWildcardSubdomains()
              .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var username = context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: username,
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

if (string.IsNullOrEmpty(identidadAjustes.Secreto))
{
    throw new Exception("La clave secreta (Secreto) no puede estar vacía.");
}

builder.Services.AddAuthentication(auth =>
{
    auth.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    auth.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(opt =>
{
    opt.SaveToken = true;
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(identidadAjustes.Secreto)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        RequireExpirationTime = false,
        ClockSkew = TimeSpan.Zero,
    };
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AplicacionBdContexto>();

var app = builder.Build();

app.UseResponseCompression();
app.UseMiddleware<ManejadorExcepcionesGlobal>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("PoliticasCors");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.Run();
