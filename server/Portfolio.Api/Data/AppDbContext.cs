using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Experience> Experiences => Set<Experience>();
    public DbSet<SkillCategory> SkillCategories => Set<SkillCategory>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<Translation> Translations => Set<Translation>();
    public DbSet<Personal> Personals => Set<Personal>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Project>(e =>
        {
            e.ToTable("project");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Slug).HasColumnName("slug").IsRequired().HasMaxLength(128);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.Color).HasColumnName("color").HasMaxLength(16);
            e.Property(x => x.TypeKey).HasColumnName("type_key").HasMaxLength(64);
            e.Property(x => x.Github).HasColumnName("github");
            e.Property(x => x.Live).HasColumnName("live");
            e.Property(x => x.Tags).HasColumnName("tags").HasColumnType("jsonb");
            e.Property(x => x.DataTr).HasColumnName("data_tr").HasColumnType("jsonb");
            e.Property(x => x.DataEn).HasColumnName("data_en").HasColumnType("jsonb");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<Experience>(e =>
        {
            e.ToTable("experience");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsEducation).HasColumnName("is_education");
            e.Property(x => x.Period).HasColumnName("period").HasMaxLength(64);
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.Tech).HasColumnName("tech").HasColumnType("jsonb");
            e.Property(x => x.DataTr).HasColumnName("data_tr").HasColumnType("jsonb");
            e.Property(x => x.DataEn).HasColumnName("data_en").HasColumnType("jsonb");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<SkillCategory>(e =>
        {
            e.ToTable("skill_category");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.Icon).HasColumnName("icon").HasMaxLength(32);
            e.Property(x => x.TitleTr).HasColumnName("title_tr").HasMaxLength(128);
            e.Property(x => x.TitleEn).HasColumnName("title_en").HasMaxLength(128);
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.Skills).HasColumnName("skills").HasColumnType("jsonb");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<BlogPost>(e =>
        {
            e.ToTable("blog_post");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Slug).HasColumnName("slug").IsRequired().HasMaxLength(128);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.SortOrder).HasColumnName("sort_order");
            e.Property(x => x.IsFeatured).HasColumnName("is_featured");
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.Category).HasColumnName("category").HasMaxLength(32);
            e.Property(x => x.Color).HasColumnName("color").HasMaxLength(16);
            e.Property(x => x.PublishedAt).HasColumnName("published_at");
            e.Property(x => x.Tags).HasColumnName("tags").HasColumnType("jsonb");
            e.Property(x => x.DataTr).HasColumnName("data_tr").HasColumnType("jsonb");
            e.Property(x => x.DataEn).HasColumnName("data_en").HasColumnType("jsonb");
            e.Property(x => x.ContentTr).HasColumnName("content_tr").HasColumnType("jsonb");
            e.Property(x => x.ContentEn).HasColumnName("content_en").HasColumnType("jsonb");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<Translation>(e =>
        {
            e.ToTable("translation");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Section).HasColumnName("section").IsRequired().HasMaxLength(32);
            e.HasIndex(x => x.Section).IsUnique();
            e.Property(x => x.DataTr).HasColumnName("data_tr").HasColumnType("jsonb");
            e.Property(x => x.DataEn).HasColumnName("data_en").HasColumnType("jsonb");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<Personal>(e =>
        {
            e.ToTable("personal");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(128);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(256);
            e.Property(x => x.Location).HasColumnName("location").HasMaxLength(128);
            e.Property(x => x.Github).HasColumnName("github");
            e.Property(x => x.Linkedin).HasColumnName("linkedin");
            e.Property(x => x.CvUrl).HasColumnName("cv_url");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<SiteSettings>(e =>
        {
            e.ToTable("site_settings");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.DataTr).HasColumnName("data_tr").HasColumnType("jsonb");
            e.Property(x => x.DataEn).HasColumnName("data_en").HasColumnType("jsonb");
            e.Property(x => x.BrandingJson).HasColumnName("branding_json").HasColumnType("jsonb");
            e.Property(x => x.SchemaJson).HasColumnName("schema_json").HasColumnType("jsonb");
            e.Property(x => x.OperationsJson).HasColumnName("operations_json").HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
            e.Property(x => x.SecurityJson).HasColumnName("security_json").HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
            e.Property(x => x.CommunicationsJson).HasColumnName("communications_json").HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        });

        mb.Entity<ContactMessage>(e =>
        {
            e.ToTable("contact_message");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            e.Property(x => x.Email).HasColumnName("email").IsRequired().HasMaxLength(200);
            e.Property(x => x.Message).HasColumnName("message").IsRequired();
            e.Property(x => x.Lang).HasColumnName("lang").HasMaxLength(8);
            e.Property(x => x.IpAddress).HasColumnName("ip_address").HasMaxLength(64);
            e.Property(x => x.UserAgent).HasColumnName("user_agent").HasMaxLength(512);
            e.Property(x => x.IsRead).HasColumnName("is_read");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.CreatedAt);
        });
    }
}
