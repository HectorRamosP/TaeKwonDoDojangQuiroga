using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AgregarHistorialCintaYJustificadaAsistencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Justificada",
                table: "Asistencias",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "HistorialCintas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaObtencion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AlumnoId = table.Column<int>(type: "int", nullable: false),
                    CintaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistorialCintas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistorialCintas_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistorialCintas_Cintas_CintaId",
                        column: x => x.CintaId,
                        principalTable: "Cintas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistorialCintas_AlumnoId_FechaObtencion",
                table: "HistorialCintas",
                columns: new[] { "AlumnoId", "FechaObtencion" });

            migrationBuilder.CreateIndex(
                name: "IX_HistorialCintas_CintaId",
                table: "HistorialCintas",
                column: "CintaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistorialCintas");

            migrationBuilder.DropColumn(
                name: "Justificada",
                table: "Asistencias");
        }
    }
}
