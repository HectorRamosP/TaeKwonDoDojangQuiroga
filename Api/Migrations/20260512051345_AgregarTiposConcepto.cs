using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTiposConcepto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TiposConcepto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Orden = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposConcepto", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "TiposConcepto",
                columns: new[] { "Id", "Activo", "Descripcion", "Nombre", "Orden" },
                values: new object[,]
                {
                    { 1, true, "Pago mensual de membresía", "Mensualidad", 1 },
                    { 2, true, "Pago de inscripción inicial", "Inscripcion", 2 },
                    { 3, true, "Pago para examen de grado (cinta)", "Examen", 3 },
                    { 4, true, "Compra de uniforme (dobok)", "Uniforme", 4 },
                    { 5, true, "Concepto de cobro genérico", "Otro", 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_TiposConcepto_Nombre",
                table: "TiposConcepto",
                column: "Nombre",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TiposConcepto");
        }
    }
}
