using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Portfolio.Api.Domain;

#nullable disable

namespace Portfolio.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContentEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "blog_post",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    slug = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    category = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    color = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    published_at = table.Column<DateOnly>(type: "date", nullable: true),
                    tags = table.Column<List<string>>(type: "jsonb", nullable: false),
                    data_tr = table.Column<BlogPostLocale>(type: "jsonb", nullable: false),
                    data_en = table.Column<BlogPostLocale>(type: "jsonb", nullable: false),
                    content_tr = table.Column<List<BlogBlock>>(type: "jsonb", nullable: false),
                    content_en = table.Column<List<BlogBlock>>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_blog_post", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "experience",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_education = table.Column<bool>(type: "boolean", nullable: false),
                    period = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    tech = table.Column<List<string>>(type: "jsonb", nullable: false),
                    data_tr = table.Column<ExperienceLocale>(type: "jsonb", nullable: false),
                    data_en = table.Column<ExperienceLocale>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_experience", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "personal",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    location = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    github = table.Column<string>(type: "text", nullable: true),
                    linkedin = table.Column<string>(type: "text", nullable: true),
                    cv_url = table.Column<string>(type: "text", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_personal", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "skill_category",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    icon = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    title_tr = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    title_en = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    skills = table.Column<List<SkillItem>>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skill_category", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "translation",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    section = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    data_tr = table.Column<JsonElement>(type: "jsonb", nullable: false),
                    data_en = table.Column<JsonElement>(type: "jsonb", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_translation", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_blog_post_slug",
                table: "blog_post",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_translation_section",
                table: "translation",
                column: "section",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "blog_post");

            migrationBuilder.DropTable(
                name: "experience");

            migrationBuilder.DropTable(
                name: "personal");

            migrationBuilder.DropTable(
                name: "skill_category");

            migrationBuilder.DropTable(
                name: "translation");
        }
    }
}
