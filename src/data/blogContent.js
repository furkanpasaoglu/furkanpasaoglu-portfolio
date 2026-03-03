// Full article content for blog posts
// Each post has sections: { type: 'heading'|'paragraph'|'code'|'note', text }

export const blogContent = {
  tr: {
    1: [
      { type: 'paragraph', text: 'N-Tier mimariden Clean Architecture\'a geçiş kararı, projenin büyümesiyle birlikte kaçınılmaz hale geldi. Katmanlar arası sıkı bağımlılıklar, test yazmanın zorluğu ve iş kurallarının veritabanı katmanına sızması bizi harekete geçirdi.' },
      { type: 'heading', text: 'Neden Clean Architecture?' },
      { type: 'paragraph', text: 'Clean Architecture\'ın temel fikri şu: iş kuralları hiçbir şeye bağımlı olmamalı. Veritabanı değişirse, UI değişirse, hatta framework değişirse — domain katmanınız bunlardan etkilenmez.' },
      { type: 'note', text: 'Temel kural: Dependency arrow\'lar sadece içe doğru akar. Domain → Application → Infrastructure, şeklinde değil; tam tersi: Infrastructure → Application → Domain.' },
      { type: 'heading', text: 'Katman Yapısı' },
      { type: 'paragraph', text: '4 temel katman oluşturduk: Domain (entity\'ler, value object\'ler, domain event\'ler), Application (use case\'ler, CQRS komutları, interface tanımları), Infrastructure (veritabanı, mesaj kuyruğu, dış servisler) ve Presentation (API controller\'ları, middleware).' },
      { type: 'code', lang: 'csharp', text: `// Domain Layer — hiçbir dış bağımlılık yok
public class Order : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();
    private readonly List<OrderItem> _items = new();

    public static Order Create(Guid customerId)
    {
        var order = new Order { CustomerId = customerId };
        order.AddDomainEvent(new OrderCreatedEvent(order.Id));
        return order;
    }

    public void AddItem(Guid productId, decimal price, int qty)
    {
        _items.Add(new OrderItem(productId, price, qty));
    }
}` },
      { type: 'heading', text: 'Application Katmanı ve CQRS' },
      { type: 'paragraph', text: 'Application katmanında MediatR ile CQRS pattern\'ini uyguladık. Her use case bir Command veya Query olarak modellendi. Bu sayede okuma ve yazma operasyonları tamamen ayrıştı.' },
      { type: 'code', lang: 'csharp', text: `// Application Layer — sadece Domain ve abstraction\'lara bağımlı
public record CreateOrderCommand(Guid CustomerId, List<OrderItemDto> Items)
    : IRequest<Guid>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _repo;
    private readonly IUnitOfWork _uow;

    public CreateOrderCommandHandler(IOrderRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId);
        foreach (var item in cmd.Items)
            order.AddItem(item.ProductId, item.Price, item.Quantity);

        await _repo.AddAsync(order, ct);
        await _uow.SaveChangesAsync(ct);
        return order.Id;
    }
}` },
      { type: 'heading', text: 'Sonuç' },
      { type: 'paragraph', text: 'Geçiş sürecinde en çok vakit alan şey mevcut kodun refactor edilmesiydi. Ancak sonuç oldukça tatmin ediciydi: unit test coverage %8\'den %74\'e çıktı, yeni feature geliştirme süresi ortalama %40 azaldı. Clean Architecture "overkill" gibi görünebilir küçük projeler için, ancak growth mindset\'iyle yaklaşırsanız uzun vadede kazandırıyor.' },
    ],
    2: [
      { type: 'paragraph', text: 'Bir projede e-posta gönderme, rapor üretme ve toplu veri işleme gibi görevler kullanıcı isteklerini yavaşlatıyordu. Bu işlemleri HTTP döngüsünden çıkarıp arka planda yürütmek için Hangfire\'yi devreye aldık.' },
      { type: 'heading', text: 'Hangfire Nedir?' },
      { type: 'paragraph', text: 'Hangfire, .NET için geliştirilmiş açık kaynaklı bir arka plan iş kütüphanesidir. Fire-and-forget, zamanlanmış tekrarlı (CRON), zincirleme ve toplu görevleri destekler. Persisted queue sayesinde uygulama yeniden başlatılsa bile görevler kaybolmaz.' },
      { type: 'note', text: 'Hangfire işleri varsayılan olarak SQL Server veya Redis\'e kaydedilir. Uygulama çökse bile iş kaldığı yerden devam eder.' },
      { type: 'heading', text: 'Temel İş Türleri' },
      { type: 'paragraph', text: 'Hangfire dört farklı iş türünü destekler. Kullanım şekline göre doğru türü seçmek hem performans hem de yönetilebilirlik açısından kritiktir.' },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Hangfire kurulumu
builder.Services.AddHangfire(cfg => cfg
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseSqlServerStorage(connectionString));
builder.Services.AddHangfireServer();

// 1. Fire-and-forget: tek seferlik, hemen çalış
BackgroundJob.Enqueue<IEmailService>(s => s.SendWelcomeEmailAsync(userId));

// 2. Delayed: belirli süre sonra çalış
BackgroundJob.Schedule<IReportService>(
    s => s.GenerateMonthlyReportAsync(), TimeSpan.FromHours(1));

// 3. Recurring: CRON ile tekrarlı
RecurringJob.AddOrUpdate<ICleanupService>(
    "cleanup-expired-tokens",
    s => s.RemoveExpiredTokensAsync(),
    Cron.Daily);

// 4. Continuations: zincirleme iş
var jobId = BackgroundJob.Enqueue<IOrderService>(s => s.ProcessAsync(orderId));
BackgroundJob.ContinueJobWith<INotificationService>(
    jobId, s => s.NotifyCustomerAsync(orderId));` },
      { type: 'heading', text: 'Dashboard ve İzleme' },
      { type: 'paragraph', text: 'Hangfire, yerleşik bir web dashboard\'ıyla gelir. Başarılı, bekleyen, başarısız ve tekrarlı işlerin tümünü tek sayfadan takip edebilirsiniz. Başarısız işleri anında yeniden tetiklemek mümkün.' },
      { type: 'code', lang: 'csharp', text: `// Dashboard erişimini rolüne göre kısıtla
app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization = [new HangfireAuthorizationFilter()]
});

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext ctx)
    {
        var httpCtx = ctx.GetHttpContext();
        return httpCtx.User.IsInRole("Admin");
    }
}` },
      { type: 'heading', text: 'Sonuçlar' },
      { type: 'paragraph', text: 'Hangfire\'yi devreye aldıktan sonra e-posta gönderme işlemleri HTTP yanıt süresini hiç etkilemez hale geldi. Toplu rapor üretiminde yaşadığımız zaman aşımı hataları tamamen ortadan kalktı. Başarısız işlerde otomatik yeniden deneme (retry) mekanizması sayesinde çok az sayıda log incelememiz yeterli oluyor.' },
    ],
    3: [
      { type: 'paragraph', text: 'Bir enterprise CRM projesinde kullanıcılar "Bunu daha önce gördüm ama tam olarak ne demiştim?" diye soruyordu. Klasik keyword search yetersiz kalıyordu. Semantic search ile bu sorunu çözdük.' },
      { type: 'heading', text: 'Semantic Search Nedir?' },
      { type: 'paragraph', text: 'Keyword search metinleri karakter karakter karşılaştırır. Semantic search ise metnin anlamını vektörle temsil eder. "Kira ödendi" ile "Aylık aidat alındı" farklı kelimeler ama benzer anlam — semantic search bunu yakalar.' },
      { type: 'heading', text: 'Mimari: Semantic Kernel + Qdrant' },
      { type: 'paragraph', text: 'Kullandığımız stack: Microsoft Semantic Kernel (orchestration), OpenAI text-embedding-3-small modeli (vektörleştirme), Qdrant (vector database). Tüm iletişim logları embedding\'lenerek Qdrant\'a yüklendi.' },
      { type: 'code', lang: 'csharp', text: `// Semantic Kernel ile embedding ve arama
var kernel = Kernel.CreateBuilder()
    .AddOpenAITextEmbeddingGeneration("text-embedding-3-small", apiKey)
    .Build();

var embeddingService = kernel.GetRequiredService<ITextEmbeddingGenerationService>();

// Metin → vektör
var embedding = await embeddingService.GenerateEmbeddingAsync(userQuery);

// Qdrant'ta benzer vektörleri ara
var searchResult = await qdrantClient.SearchAsync(
    collectionName: "communication_logs",
    vector: embedding.ToArray(),
    limit: 10,
    scoreThreshold: 0.75f
);` },
      { type: 'heading', text: 'Sonuçlar' },
      { type: 'paragraph', text: 'İlk deployment\'tan sonra arama doğruluğu %340 arttı (recall@10 metriği). Kullanıcılar artık tam kelimeyi bilmeden de arama yapabiliyordu. Embedding maliyeti ilk başta endişe yaratsa da text-embedding-3-small\'ın düşük fiyatı sayesinde ayda sadece ~$12 harcıyoruz.' },
    ],
    4: [
      { type: 'paragraph', text: 'CQRS (Command Query Responsibility Segregation) teoride çok mantıklı görünür: okuma ve yazmayı ayır. Ama pratikte nasıl uygulanır? MediatR bu geçişi inanılmaz kolaylaştırıyor.' },
      { type: 'heading', text: 'Neden CQRS?' },
      { type: 'paragraph', text: 'Klasik repository pattern\'inde tek bir servis hem GetById hem Create hem Update işini yapar. Bu zamanla "God Service" oluşturur. CQRS ile her operasyon kendi handler\'ında izole edilir.' },
      { type: 'code', lang: 'csharp', text: `// Query — sadece okuma, side effect yok
public record GetCustomerQuery(Guid Id) : IRequest<CustomerDto>;

public class GetCustomerQueryHandler : IRequestHandler<GetCustomerQuery, CustomerDto>
{
    private readonly IReadDbContext _db; // Read-only context

    public async Task<CustomerDto> Handle(GetCustomerQuery q, CancellationToken ct)
    {
        return await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == q.Id)
            .Select(c => new CustomerDto(c.Id, c.Name, c.Email))
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException(q.Id);
    }
}

// Command — write, validation, domain logic
public record UpdateCustomerEmailCommand(Guid Id, string NewEmail) : IRequest;

public class UpdateCustomerEmailCommandHandler
    : IRequestHandler<UpdateCustomerEmailCommand>
{
    private readonly ICustomerRepository _repo;
    private readonly IUnitOfWork _uow;

    public async Task Handle(UpdateCustomerEmailCommand cmd, CancellationToken ct)
    {
        var customer = await _repo.GetByIdAsync(cmd.Id, ct)
            ?? throw new NotFoundException(cmd.Id);

        customer.ChangeEmail(cmd.NewEmail); // Domain method
        await _uow.SaveChangesAsync(ct);
    }
}` },
      { type: 'heading', text: 'Pipeline Behavior ile Cross-Cutting Concerns' },
      { type: 'paragraph', text: 'MediatR\'ın en güçlü özelliklerinden biri Pipeline Behavior. Validation, logging, caching gibi cross-cutting concern\'leri tek bir yerde yönetebilirsiniz.' },
      { type: 'code', lang: 'csharp', text: `public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!_validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next();
    }
}` },
    ],
    5: [
      { type: 'paragraph', text: 'Production\'da ne olduğunu bilmek, sorun çıkmadan önce müdahale etmekten geçer. Bir projede deployment sonrası aniden yavaşlayan endpoint\'leri ve sessiz sedasız çöken arka plan servislerini ancak kullanıcılar şikayet ettikten sonra fark ediyorduk. Proper monitoring ile bu durumu kökten değiştirdik.' },
      { type: 'heading', text: 'ASP.NET Core Health Checks' },
      { type: 'paragraph', text: 'Health Checks API, uygulamanın ve bağımlılıklarının (veritabanı, cache, dış servisler) durumunu anlık olarak sorgulamanızı sağlar. Kubernetes, load balancer veya izleme araçlarıyla kolayca entegre edilir.' },
      { type: 'note', text: '/health/live ve /health/ready endpoint\'lerini ayırın: liveness uygulamanın ayakta olup olmadığını, readiness ise trafik almaya hazır olup olmadığını belirtir.' },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Health Check kurulumu
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database", tags: ["db"])
    .AddRedis(redisConnection, name: "cache", tags: ["cache"])
    .AddUrlGroup(new Uri("https://api.partner.com/ping"), name: "partner-api");

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db") || check.Tags.Contains("cache"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});` },
      { type: 'heading', text: 'Serilog ile Yapılandırılmış Loglama' },
      { type: 'paragraph', text: 'Console.WriteLine\'dan vazgeçin. Serilog, logları hem konsola hem de Seq, Elasticsearch veya dosyaya yapılandırılmış (structured) biçimde yazar. Filtreleme ve arama çok daha kolay hale gelir.' },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Serilog kurulumu
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();

// Kullanım — property'li structured log
_logger.LogInformation(
    "Order {OrderId} completed for customer {CustomerId} in {ElapsedMs}ms",
    order.Id, order.CustomerId, elapsed.TotalMilliseconds);` },
      { type: 'heading', text: 'Sonuçlar' },
      { type: 'paragraph', text: 'Health check endpoint\'lerini devreye aldıktan sonra load balancer sağlıklı olmayan instance\'ları otomatik devre dışı bırakmaya başladı. Serilog ile yapılandırılmış loglama sayesinde production sorunlarını ortalama 45 dakikadan 8 dakikaya düşürdük. Seq üzerinden filtrelenebilir loglar, debug sürecini tamamen değiştirdi.' },
    ],
    6: [
      { type: 'paragraph', text: 'EF Core güçlü ve kullanışlı ama yanlış kullanıldığında production veritabanını felç edebilir. Gerçek projelerden derlediğim performans tuzaklarını paylaşıyorum.' },
      { type: 'heading', text: '1. N+1 Problemi' },
      { type: 'paragraph', text: 'En yaygın hata. Bir koleksiyonu döngüyle gezerken her iterasyonda ayrı bir sorgu fırlatmak. 100 müşteri varsa 101 sorgu gidebilir.' },
      { type: 'code', lang: 'csharp', text: `// ❌ YANLIŞ — N+1 problemi
var customers = await db.Customers.ToListAsync();
foreach (var c in customers)
{
    // Her iterasyonda ayrı sorgu!
    var orders = await db.Orders.Where(o => o.CustomerId == c.Id).ToListAsync();
}

// ✅ DOĞRU — tek sorguda eager loading
var customers = await db.Customers
    .Include(c => c.Orders)
    .ToListAsync();

// ✅ DAHA İYİ — projection ile sadece gereken veri
var result = await db.Customers
    .Select(c => new CustomerWithOrderCountDto
    {
        Id = c.Id,
        Name = c.Name,
        OrderCount = c.Orders.Count
    })
    .ToListAsync();` },
      { type: 'heading', text: '2. AsNoTracking\'i Unutmak' },
      { type: 'paragraph', text: 'Read-only sorgularda EF Core entity\'leri change tracker\'a ekler. Bu gereksiz bellek ve CPU kullanımı demek. Okuma sorgularında her zaman AsNoTracking() kullanın.' },
      { type: 'code', lang: 'csharp', text: `// ❌ Gereksiz tracking — sadece okuyacaksak
var products = await db.Products.Where(p => p.IsActive).ToListAsync();

// ✅ Doğru — tracking yok, daha hızlı
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();` },
      { type: 'heading', text: '3. Select Yerine Tüm Entity\'yi Çekmek' },
      { type: 'paragraph', text: 'Customer entity\'nizde 30 kolon var ama ekranda sadece isim ve email göstereceksiniz. SELECT * yapmak yerine projeksiyon kullanın.' },
      { type: 'code', lang: 'csharp', text: `// ❌ 30 kolon çekiyoruz, 2 tane kullanıyoruz
var customers = await db.Customers.ToListAsync();
var names = customers.Select(c => c.Name);

// ✅ Sadece gereken kolonlar
var names = await db.Customers
    .Select(c => new { c.Name, c.Email })
    .ToListAsync();` },
      { type: 'heading', text: 'Sonuç' },
      { type: 'paragraph', text: 'Bu üç hatayı düzelttikten sonra bir raporlama endpoint\'inin response süresi 4200ms\'den 180ms\'ye düştü. EF Core\'u suçlamadan önce ürettiği SQL\'leri inceleyin — MiniProfiler veya EF Core logging ile bunu kolayca yapabilirsiniz.' },
    ],
  },
  en: {
    1: [
      { type: 'paragraph', text: 'The decision to migrate from N-Tier to Clean Architecture became inevitable as the project grew. Tight coupling between layers, difficulty writing tests, and business rules leaking into the data layer forced us to act.' },
      { type: 'heading', text: 'Why Clean Architecture?' },
      { type: 'paragraph', text: 'The core idea of Clean Architecture: business rules should depend on nothing. If the database changes, the UI changes, or even the framework changes — your domain layer is unaffected.' },
      { type: 'note', text: 'Key rule: Dependency arrows only point inward. Infrastructure → Application → Domain. Never the other way around.' },
      { type: 'heading', text: 'Layer Structure' },
      { type: 'paragraph', text: 'We created 4 core layers: Domain (entities, value objects, domain events), Application (use cases, CQRS commands, interface definitions), Infrastructure (database, message queue, external services), and Presentation (API controllers, middleware).' },
      { type: 'code', lang: 'csharp', text: `// Domain Layer — zero external dependencies
public class Order : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();
    private readonly List<OrderItem> _items = new();

    public static Order Create(Guid customerId)
    {
        var order = new Order { CustomerId = customerId };
        order.AddDomainEvent(new OrderCreatedEvent(order.Id));
        return order;
    }

    public void AddItem(Guid productId, decimal price, int qty)
    {
        _items.Add(new OrderItem(productId, price, qty));
    }
}` },
      { type: 'heading', text: 'Application Layer and CQRS' },
      { type: 'paragraph', text: 'In the Application layer, we implemented the CQRS pattern with MediatR. Each use case is modeled as a Command or a Query, fully decoupling read and write operations.' },
      { type: 'code', lang: 'csharp', text: `// Application Layer — depends only on Domain and abstractions
public record CreateOrderCommand(Guid CustomerId, List<OrderItemDto> Items)
    : IRequest<Guid>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _repo;
    private readonly IUnitOfWork _uow;

    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId);
        foreach (var item in cmd.Items)
            order.AddItem(item.ProductId, item.Price, item.Quantity);

        await _repo.AddAsync(order, ct);
        await _uow.SaveChangesAsync(ct);
        return order.Id;
    }
}` },
      { type: 'heading', text: 'Results' },
      { type: 'paragraph', text: 'The most time-consuming part was refactoring existing code. But the results were worth it: unit test coverage went from 8% to 74%, and average feature development time dropped by ~40%. Clean Architecture may seem like overkill for small projects, but with a growth mindset, it pays off in the long run.' },
    ],
    2: [
      { type: 'paragraph', text: 'In one of our projects, operations like sending emails, generating reports, and processing bulk data were slowing down user requests. We introduced Hangfire to move these tasks out of the HTTP pipeline and run them in the background.' },
      { type: 'heading', text: 'What is Hangfire?' },
      { type: 'paragraph', text: 'Hangfire is an open-source background job library for .NET. It supports fire-and-forget, recurring (CRON), delayed, and continuation jobs. Thanks to its persisted queue, jobs are never lost even if the application restarts.' },
      { type: 'note', text: 'Hangfire persists jobs to SQL Server or Redis by default. Even if the application crashes, jobs resume from where they left off.' },
      { type: 'heading', text: 'Core Job Types' },
      { type: 'paragraph', text: 'Hangfire supports four distinct job types. Choosing the right type for your use case is critical for both performance and maintainability.' },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Hangfire setup
builder.Services.AddHangfire(cfg => cfg
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseSqlServerStorage(connectionString));
builder.Services.AddHangfireServer();

// 1. Fire-and-forget: run once, immediately
BackgroundJob.Enqueue<IEmailService>(s => s.SendWelcomeEmailAsync(userId));

// 2. Delayed: run after a specific time
BackgroundJob.Schedule<IReportService>(
    s => s.GenerateMonthlyReportAsync(), TimeSpan.FromHours(1));

// 3. Recurring: run on a CRON schedule
RecurringJob.AddOrUpdate<ICleanupService>(
    "cleanup-expired-tokens",
    s => s.RemoveExpiredTokensAsync(),
    Cron.Daily);

// 4. Continuations: chain jobs together
var jobId = BackgroundJob.Enqueue<IOrderService>(s => s.ProcessAsync(orderId));
BackgroundJob.ContinueJobWith<INotificationService>(
    jobId, s => s.NotifyCustomerAsync(orderId));` },
      { type: 'heading', text: 'Dashboard & Monitoring' },
      { type: 'paragraph', text: "Hangfire ships with a built-in web dashboard. You can monitor all succeeded, enqueued, failed, and recurring jobs from a single page. Failed jobs can be retried instantly with one click." },
      { type: 'code', lang: 'csharp', text: `// Restrict dashboard access by role
app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization = [new HangfireAuthorizationFilter()]
});

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext ctx)
    {
        var httpCtx = ctx.GetHttpContext();
        return httpCtx.User.IsInRole("Admin");
    }
}` },
      { type: 'heading', text: 'Results' },
      { type: 'paragraph', text: "After deploying Hangfire, email delivery no longer impacted HTTP response times. Timeout errors we experienced during bulk report generation disappeared completely. The automatic retry mechanism means we rarely need to dig through logs — failures resolve themselves." },
    ],
    3: [
      { type: 'paragraph', text: 'In an enterprise CRM, users kept asking "I\'ve seen this before, but what exactly did I say?" Classic keyword search was falling short. We solved this with semantic search.' },
      { type: 'heading', text: 'What is Semantic Search?' },
      { type: 'paragraph', text: 'Keyword search compares text character by character. Semantic search represents meaning as a vector. "Rent received" and "Monthly payment collected" use different words but have similar meaning — semantic search captures that.' },
      { type: 'heading', text: 'Architecture: Semantic Kernel + Qdrant' },
      { type: 'paragraph', text: 'Our stack: Microsoft Semantic Kernel (orchestration), OpenAI text-embedding-3-small (vectorization), Qdrant (vector database). All communication logs were embedded and loaded into Qdrant.' },
      { type: 'code', lang: 'csharp', text: `// Embedding and search with Semantic Kernel
var kernel = Kernel.CreateBuilder()
    .AddOpenAITextEmbeddingGeneration("text-embedding-3-small", apiKey)
    .Build();

var embeddingService = kernel.GetRequiredService<ITextEmbeddingGenerationService>();

// Text → vector
var embedding = await embeddingService.GenerateEmbeddingAsync(userQuery);

// Search for similar vectors in Qdrant
var searchResult = await qdrantClient.SearchAsync(
    collectionName: "communication_logs",
    vector: embedding.ToArray(),
    limit: 10,
    scoreThreshold: 0.75f
);` },
      { type: 'heading', text: 'Results' },
      { type: 'paragraph', text: 'After the first deployment, search accuracy improved by 340% (recall@10 metric). Users could now search without knowing the exact keywords. Despite initial cost concerns, text-embedding-3-small\'s low pricing means we\'re spending only ~$12/month.' },
    ],
    4: [
      { type: 'paragraph', text: 'CQRS (Command Query Responsibility Segregation) sounds very logical in theory: separate reads and writes. But how do you implement it in practice? MediatR makes this transition incredibly smooth.' },
      { type: 'heading', text: 'Why CQRS?' },
      { type: 'paragraph', text: 'In classic repository pattern, a single service handles GetById, Create, and Update. Over time this creates "God Services". With CQRS, each operation is isolated in its own handler.' },
      { type: 'code', lang: 'csharp', text: `// Query — read only, no side effects
public record GetCustomerQuery(Guid Id) : IRequest<CustomerDto>;

public class GetCustomerQueryHandler : IRequestHandler<GetCustomerQuery, CustomerDto>
{
    private readonly IReadDbContext _db; // Read-only context

    public async Task<CustomerDto> Handle(GetCustomerQuery q, CancellationToken ct)
    {
        return await _db.Customers
            .AsNoTracking()
            .Where(c => c.Id == q.Id)
            .Select(c => new CustomerDto(c.Id, c.Name, c.Email))
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException(q.Id);
    }
}` },
      { type: 'heading', text: 'Cross-Cutting Concerns with Pipeline Behavior' },
      { type: 'paragraph', text: 'One of MediatR\'s most powerful features is Pipeline Behavior. It lets you manage cross-cutting concerns like validation, logging, and caching in a single place.' },
      { type: 'code', lang: 'csharp', text: `public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!_validators.Any()) return await next();

        var failures = _validators
            .Select(v => v.Validate(new ValidationContext<TRequest>(request)))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next();
    }
}` },
    ],
    5: [
      { type: 'paragraph', text: "Knowing what happens in production is the key to acting before things break. On one project, we only discovered slowdowns and silently crashing background services after users complained. Proper monitoring changed that completely." },
      { type: 'heading', text: 'ASP.NET Core Health Checks' },
      { type: 'paragraph', text: "The Health Checks API lets you query the real-time status of your application and its dependencies (database, cache, external services). It integrates seamlessly with Kubernetes, load balancers, and monitoring tools." },
      { type: 'note', text: 'Separate /health/live and /health/ready endpoints: liveness indicates whether the app is running, readiness indicates whether it can accept traffic.' },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Health Check setup
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database", tags: ["db"])
    .AddRedis(redisConnection, name: "cache", tags: ["cache"])
    .AddUrlGroup(new Uri("https://api.partner.com/ping"), name: "partner-api");

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db") || check.Tags.Contains("cache"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});` },
      { type: 'heading', text: 'Structured Logging with Serilog' },
      { type: 'paragraph', text: "Drop Console.WriteLine. Serilog writes logs in structured format to the console, Seq, Elasticsearch, or files. Filtering and searching become dramatically easier." },
      { type: 'code', lang: 'csharp', text: `// Program.cs — Serilog setup
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();

// Usage — structured log with properties
_logger.LogInformation(
    "Order {OrderId} completed for customer {CustomerId} in {ElapsedMs}ms",
    order.Id, order.CustomerId, elapsed.TotalMilliseconds);` },
      { type: 'heading', text: 'Results' },
      { type: 'paragraph', text: "After enabling health check endpoints, the load balancer started automatically removing unhealthy instances from rotation. Structured logging with Serilog cut our average production issue resolution time from 45 minutes to 8 minutes. Filterable logs in Seq completely transformed the debugging experience." },
    ],
    6: [
      { type: 'paragraph', text: 'EF Core is powerful and convenient, but when misused it can cripple a production database. Here are the performance pitfalls I\'ve collected from real projects.' },
      { type: 'heading', text: '1. The N+1 Problem' },
      { type: 'paragraph', text: 'The most common mistake. Firing a separate query on each iteration while looping through a collection. With 100 customers, that\'s 101 queries.' },
      { type: 'code', lang: 'csharp', text: `// ❌ WRONG — N+1 problem
var customers = await db.Customers.ToListAsync();
foreach (var c in customers)
{
    // Separate query on every iteration!
    var orders = await db.Orders.Where(o => o.CustomerId == c.Id).ToListAsync();
}

// ✅ CORRECT — eager loading in a single query
var customers = await db.Customers
    .Include(c => c.Orders)
    .ToListAsync();

// ✅ BETTER — projection with only required data
var result = await db.Customers
    .Select(c => new CustomerWithOrderCountDto
    {
        Id = c.Id,
        Name = c.Name,
        OrderCount = c.Orders.Count
    })
    .ToListAsync();` },
      { type: 'heading', text: '2. Forgetting AsNoTracking' },
      { type: 'code', lang: 'csharp', text: `// ❌ Unnecessary tracking — if we're only reading
var products = await db.Products.Where(p => p.IsActive).ToListAsync();

// ✅ Correct — no tracking, faster
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();` },
      { type: 'heading', text: 'Results' },
      { type: 'paragraph', text: 'Fixing these three issues reduced a reporting endpoint\'s response time from 4200ms to 180ms. Before blaming EF Core, examine the SQL it generates — MiniProfiler or EF Core logging makes this easy.' },
    ],
  },
};
