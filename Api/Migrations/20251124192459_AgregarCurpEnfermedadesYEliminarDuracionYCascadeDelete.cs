using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCurpEnfermedadesYEliminarDuracionYCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DuracionDias",
                table: "Conceptos");

            migrationBuilder.AddColumn<string>(
                name: "Curp",
                table: "Alumnos",
                type: "nvarchar(18)",
                maxLength: 18,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Enfermedades",
                table: "Alumnos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "No");

            // Update existing records with temporary unique CURP values
            migrationBuilder.Sql(@"
                UPDATE Alumnos
                SET Curp = 'TEMP' + RIGHT('00000000000000' + CAST(Id AS VARCHAR(14)), 14),
                    Enfermedades = CASE WHEN Enfermedades = '' THEN 'No' ELSE Enfermedades END
                WHERE Curp = '' OR Curp IS NULL
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos",
                column: "Curp",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Curp",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Enfermedades",
                table: "Alumnos");

            migrationBuilder.AddColumn<int>(
                name: "DuracionDias",
                table: "Conceptos",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
