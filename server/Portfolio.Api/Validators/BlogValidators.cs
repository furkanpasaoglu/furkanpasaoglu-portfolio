using FluentValidation;
using Portfolio.Api.Contracts.Blog;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Validators;

public class BlogBlockValidator : AbstractValidator<BlogBlock>
{
    private static readonly string[] AllowedTypes = { "paragraph", "heading", "code", "note" };

    public BlogBlockValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty()
            .Must(t => AllowedTypes.Contains(t))
            .WithMessage("Block type must be one of: paragraph, heading, code, note.");
        RuleFor(x => x.Lang).MaximumLength(32);
    }
}

public class BlogPostLocaleValidator : AbstractValidator<BlogPostLocale>
{
    public BlogPostLocaleValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Excerpt).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Date).NotEmpty().MaximumLength(64);
        RuleFor(x => x.ReadTime).InclusiveBetween(1, 120);
    }
}

public class BlogPostUpsertValidator : AbstractValidator<BlogPostUpsertDto>
{
    public BlogPostUpsertValidator()
    {
        RuleFor(x => x.Slug).Slug();
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Color).HexColor();
        RuleForEach(x => x.Tags).NotEmpty().MaximumLength(64);
        RuleFor(x => x.DataTr).NotNull().SetValidator(new BlogPostLocaleValidator());
        RuleFor(x => x.DataEn).NotNull().SetValidator(new BlogPostLocaleValidator());
        RuleForEach(x => x.ContentTr).SetValidator(new BlogBlockValidator());
        RuleForEach(x => x.ContentEn).SetValidator(new BlogBlockValidator());
    }
}
