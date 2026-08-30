using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Api.Data.Migrations
{
    /// <summary>
    /// Note bodies changed from an array of blocks to a rich document.
    /// Both are JSON in the same jsonb column, so there is nothing to alter —
    /// this migration exists only to carry the updated model snapshot, and
    /// the rows written in the old shape keep reading.
    /// </summary>
    public partial class BlogContentAsDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
