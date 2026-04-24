namespace Portfolio.Api.Domain;

public interface ISluggable
{
    int Id { get; }
    string Slug { get; set; }
}
