using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class HacerCurpOpcionalEnAlumno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos");

            migrationBuilder.AlterColumn<string>(
                name: "Curp",
                table: "Alumnos",
                type: "nvarchar(18)",
                maxLength: 18,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(18)",
                oldMaxLength: 18);

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos",
                column: "Curp",
                unique: true,
                filter: "[Curp] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos");

            migrationBuilder.AlterColumn<string>(
                name: "Curp",
                table: "Alumnos",
                type: "nvarchar(18)",
                maxLength: 18,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(18)",
                oldMaxLength: 18,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_Curp",
                table: "Alumnos",
                column: "Curp",
                unique: true);
        }
    }
}
