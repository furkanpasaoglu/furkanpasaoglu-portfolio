using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class BilingualCv : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "cv_url",
                table: "personal",
                newName: "cv_url_tr");

            migrationBuilder.AddColumn<string>(
                name: "cv_url_en",
                table: "personal",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cv_url_en",
                table: "personal");

            migrationBuilder.RenameColumn(
                name: "cv_url_tr",
                table: "personal",
                newName: "cv_url");
        }
    }
}
