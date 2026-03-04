export const allCategories = ['all', '.NET', 'AI / ML', 'DevOps'];

export const postsData = {
  tr: [
    {
      id: 1,
      title: 'Clean Architecture: .NET Projesini Sıfırdan Yapılandırmak',
      excerpt:
        'N-Tier mimariden Clean Architecture\'a geçiş sürecinde karşılaştığım zorluklar, aldığım kararlar ve öğrendiklerim. Domain, Application, Infrastructure ve Presentation katmanlarını nasıl ayırdım?',
      date: '15 Şubat 2026',
      readTime: 12,
      category: '.NET',
      tags: ['.NET', 'Clean Architecture', 'SOLID'],
      color: '#7c6fff',
      featured: true,
    },
    {
      id: 2,
      title: 'Hangfire ile Background Job Yönetimi ve Zamanlanmış Görevler',
      excerpt:
        '.NET projelerinde tekrarlayan görevleri, sıralı işleri ve zamanlanmış süreçleri yönetmek için Hangfire nasıl kullanılır? Kurulum, dashboard ve production deneyimlerimi aktarıyorum.',
      date: '2 Ocak 2026',
      readTime: 13,
      category: '.NET',
      tags: ['Hangfire', 'Background Jobs', '.NET'],
      color: '#00d4ff',
      featured: true,
    },
    {
      id: 3,
      title: 'C# ile Semantic Search: Semantic Kernel ve Vector DB',
      excerpt:
        'OpenAI embedding\'leri, Semantic Kernel ve Qdrant kullanarak .NET uygulamasına nasıl anlamlı arama eklediğimi adım adım anlatan rehber.',
      date: '20 Aralık 2025',
      readTime: 18,
      category: 'AI / ML',
      tags: ['Semantic Kernel', 'OpenAI', 'Vector DB'],
      color: '#f59e0b',
      featured: true,
    },
    {
      id: 4,
      title: 'CQRS + MediatR: Komut ve Sorgu Ayrımını Anlamak',
      excerpt:
        'CQRS pattern\'ini MediatR kütüphanesiyle nasıl pratik hale getirirsiniz? Teorik bilgiyi gerçek projede uygulayarak edindiğim deneyimler.',
      date: '5 Kasım 2025',
      readTime: 10,
      category: '.NET',
      tags: ['CQRS', 'MediatR', 'DDD'],
      color: '#10b981',
      featured: false,
    },
    {
      id: 5,
      title: '.NET Uygulamalarında Health Checks, Logging ve Monitoring',
      excerpt:
        'Production\'da ne olduğunu bilmek, sorun çıkmadan önce müdahale etmekten geçer. ASP.NET Core Health Checks, Serilog yapılandırması ve uygulama izleme pratiklerini paylaşıyorum.',
      date: '14 Ekim 2025',
      readTime: 14,
      category: 'DevOps',
      tags: ['Health Checks', 'Serilog', 'Monitoring'],
      color: '#0ea5e9',
      featured: false,
    },
    {
      id: 6,
      title: 'Entity Framework Core Performans Tuzakları ve Çözümleri',
      excerpt:
        'N+1 sorunu, eager loading kötüye kullanımı ve yavaş sorgular. EF Core\'da farkında olmadan yaptığımız hatalar ve bunları nasıl düzeltiriz.',
      date: '1 Eylül 2025',
      readTime: 9,
      category: '.NET',
      tags: ['EF Core', 'Performance', 'PostgreSQL'],
      color: '#a78bfa',
      featured: false,
    },
  ],
  en: [
    {
      id: 1,
      title: 'Clean Architecture: Structuring a .NET Project from Scratch',
      excerpt:
        'The challenges, decisions, and lessons I encountered moving from N-Tier to Clean Architecture. How I separated Domain, Application, Infrastructure, and Presentation layers.',
      date: 'February 15, 2026',
      readTime: 12,
      category: '.NET',
      tags: ['.NET', 'Clean Architecture', 'SOLID'],
      color: '#7c6fff',
      featured: true,
    },
    {
      id: 2,
      title: 'Background Job Management with Hangfire in .NET',
      excerpt:
        'How to use Hangfire to manage recurring tasks, queued jobs, and scheduled processes in .NET projects? Setup, dashboard configuration, and lessons from production.',
      date: 'January 2, 2026',
      readTime: 13,
      category: '.NET',
      tags: ['Hangfire', 'Background Jobs', '.NET'],
      color: '#00d4ff',
      featured: true,
    },
    {
      id: 3,
      title: 'Semantic Search with C#: Semantic Kernel and Vector DB',
      excerpt:
        'A step-by-step guide on how I added meaningful search to a .NET application using OpenAI embeddings, Semantic Kernel, and Qdrant.',
      date: 'December 20, 2025',
      readTime: 18,
      category: 'AI / ML',
      tags: ['Semantic Kernel', 'OpenAI', 'Vector DB'],
      color: '#f59e0b',
      featured: true,
    },
    {
      id: 4,
      title: 'CQRS + MediatR: Understanding Command and Query Separation',
      excerpt:
        'How do you make the CQRS pattern practical with the MediatR library? My experience applying theoretical knowledge to a real project.',
      date: 'November 5, 2025',
      readTime: 10,
      category: '.NET',
      tags: ['CQRS', 'MediatR', 'DDD'],
      color: '#10b981',
      featured: false,
    },
    {
      id: 5,
      title: 'Health Checks, Logging & Monitoring in .NET Applications',
      excerpt:
        'Knowing what happens in production is the key to acting before things break. I share ASP.NET Core Health Checks setup, Serilog configuration, and application monitoring practices.',
      date: 'October 14, 2025',
      readTime: 14,
      category: 'DevOps',
      tags: ['Health Checks', 'Serilog', 'Monitoring'],
      color: '#0ea5e9',
      featured: false,
    },
    {
      id: 6,
      title: 'Entity Framework Core Performance Pitfalls and Solutions',
      excerpt:
        'N+1 problem, misuse of eager loading, and slow queries. Mistakes we unknowingly make in EF Core and how to fix them.',
      date: 'September 1, 2025',
      readTime: 9,
      category: '.NET',
      tags: ['EF Core', 'Performance', 'PostgreSQL'],
      color: '#a78bfa',
      featured: false,
    },
  ],
};
