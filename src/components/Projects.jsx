import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiGithub, FiExternalLink, FiArrowUpRight, FiUsers } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import ProjectPanel from './ProjectPanel';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

const projectsData = {
  tr: [
    {
      title: 'RentACar — Angular + .NET',
      shortDesc: 'Araba kiralama sistemi. Angular frontend, .NET Core backend, JWT auth.',
      longDesc: 'N-Tier mimarisi ile geliştirilmiş kurumsal araba kiralama uygulaması. Angular ile modern, responsive bir arayüz; .NET Core ile güçlü bir backend. JWT tabanlı kimlik doğrulama, rol yönetimi ve ödeme entegrasyonu içermektedir.',
      tags: ['Angular', 'TypeScript', '.NET Core', 'Entity Framework', 'JWT', 'MSSQL'],
      github: 'https://github.com/furkanpasaoglu/RentACar-Angular',
      live: null,
      color: '#dd0031',
      status: 'Tamamlandı',
      type: 'Full-Stack',
      highlights: [
        '29 GitHub star — toplulukta ilgi gören açık kaynak proje',
        'N-Tier Architecture — Business, DataAccess, Entities, Core katmanları',
        'JWT tabanlı auth — interceptor ile token yönetimi',
        'Araç, kategori, marka ve kullanıcı yönetimi CRUD',
        'FluentValidation ile kapsamlı backend validasyonu',
      ],
    },
    {
      title: 'ReCapProject — .NET Backend',
      shortDesc: 'Clean Architecture ile geliştirilmiş araba kiralama backend servisi.',
      longDesc: '.NET ile Katmanlı Mimari prensipleri uygulanarak geliştirilmiş kapsamlı bir araba kiralama backend projesi. Autofac IoC, Aspect-Oriented Programming ve interceptorlar gibi enterprise pattern\'ler içerir.',
      tags: ['.NET', 'C#', 'Autofac', 'AOP', 'Entity Framework', 'MSSQL', 'JWT'],
      github: 'https://github.com/furkanpasaoglu/ReCapProject',
      live: null,
      color: '#7c6fff',
      status: 'Tamamlandı',
      type: 'Backend',
      highlights: [
        '20 GitHub star — aktif olarak referans alınan eğitim projesi',
        'Autofac IoC container ile bağımlılık yönetimi',
        'AOP — Validation, Logging, Auth gibi kesişen kesimleri ayrıştırma',
        'Caching ve Transaction interceptorları',
        'Memory Cache ve JWT entegrasyonu',
      ],
    },
    {
      title: 'eShopping — Microservices',
      shortDesc: 'Event-driven e-ticaret platformu. Microservice mimarisi, RabbitMQ, Docker.',
      longDesc: 'Modern microservice mimarisi üzerine kurulu e-ticaret platformu. Her servis bağımsız deploy edilebilir. RabbitMQ ile event-driven iletişim, Docker Compose ile container orkestrasyonu sağlanmaktadır.',
      tags: ['.NET', 'C#', 'Microservices', 'RabbitMQ', 'Docker', 'API Gateway', 'Redis'],
      github: 'https://github.com/furkanpasaoglu/eShopping',
      live: null,
      color: '#00d4ff',
      status: 'Geliştiriliyor',
      type: 'Microservices',
      highlights: [
        'Event-driven architecture — RabbitMQ ile async mesajlaşma',
        'Ocelot API Gateway ile merkezi istek yönetimi',
        'Her servis bağımsız — Catalog, Basket, Order, Identity servisleri',
        'Docker Compose ile tüm ortamın tek komutla ayağa kalkması',
        'Repository Pattern ve CQRS hazırlığı',
      ],
    },
    {
      title: 'Pirelli — PHP\'den C#\'a Migrasyon',
      shortDesc: 'PHP sisteminin C#/.NET Clean Architecture ile yeniden yazılması. Identity Server entegrasyonu.',
      longDesc: 'Bilgi Birikim Sistemleri bünyesinde Pirelli için gerçekleştirilen kapsamlı sistem migrasyonu. Eski PHP altyapısı Clean Architecture ve CQRS prensipleriyle C# / .NET platformuna taşındı. Identity Server ile güvenli kullanıcı kimlik doğrulama sistemi kuruldu.',
      tags: ['C#', '.NET Core', 'Clean Architecture', 'CQRS', 'Identity Server', 'MSSQL'],
      github: null,
      live: null,
      color: '#ff6b35',
      status: 'Tamamlandı',
      type: 'Enterprise',
      client: 'Pirelli',
      highlights: [
        'PHP sisteminin C# / .NET Clean Architecture\'a başarıyla taşınması',
        'CQRS ile okuma/yazma operasyonlarının ayrıştırılması',
        'Identity Server ile güvenli kullanıcı kimlik doğrulama',
        'Ölçeklenebilir ve bakımı kolay mimari tasarımı',
      ],
    },
    {
      title: 'Türkiye Petrolleri & Derimod — CRM',
      shortDesc: 'Müşteri yönetimi modernizasyonu. Asp.Net Boilerplate, Kendo UI, SAP & REST/SOAP entegrasyonu.',
      longDesc: 'Türkiye Petrolleri & Enerjisa için müşteri yönetim sisteminin Asp.Net Boilerplate ve Kendo UI kullanılarak modernize edilmesi; REST/SOAP API ve SAP entegrasyonları. Derimod için kampanya yönetim sistemi, Windows servisleri ve .NET Core Web API geliştirme.',
      tags: ['.NET Core', 'Asp.Net Boilerplate', 'Kendo UI', 'SAP', 'REST API', 'MSSQL'],
      github: null,
      live: null,
      color: '#10b981',
      status: 'Tamamlandı',
      type: 'Enterprise',
      client: 'Türkiye Petrolleri / Derimod',
      highlights: [
        'Asp.Net Boilerplate ile müşteri yönetim sistemi modernizasyonu',
        'REST ve SOAP API entegrasyonları',
        'SAP sistem entegrasyonu',
        'Performans iyileştirmeleri ve Kendo UI arayüzü',
        'Derimod için kampanya yönetim sistemi ve Windows servis geliştirme',
      ],
    },
    {
      title: 'Allianz CRM & Dynamics 365 Entegrasyonları',
      shortDesc: 'Twitter, YouTube, Google Play ve Microsoft Dynamics 365 CRM entegrasyonları.',
      longDesc: 'Allianz CRM sistemine Twitter, YouTube ve Google Play verilerinin entegrasyonu. Karaca, FlyingTiger, Jumbo ve SharkAndNinja için Microsoft Dynamics 365 CRM entegrasyonları gerçekleştirilerek müşteri veri yönetimi ve otomasyon süreçleri iyileştirildi.',
      tags: ['Microsoft Dynamics 365', 'C#', '.NET', 'REST API', 'OAuth2', 'MSSQL'],
      github: null,
      live: null,
      color: '#f59e0b',
      status: 'Tamamlandı',
      type: 'Enterprise',
      client: 'Allianz / Karaca / Jumbo / SharkAndNinja / FlyingTiger',
      highlights: [
        'Twitter, YouTube, Google Play verilerinin Allianz CRM\'e entegrasyonu',
        'Karaca, FlyingTiger, Jumbo, SharkAndNinja için Dynamics 365 CRM entegrasyonu',
        'Müşteri veri yönetimi ve otomasyon iyileştirmeleri',
        'OAuth2 ile güvenli üçüncü taraf API entegrasyonu',
        '.NET Core ile RESTful API geliştirme',
      ],
    },
    {
      title: 'Bupa Acıbadem Sigorta Portali',
      shortDesc: 'ASP.NET Boilerplate (.NET 9 MVC) ile kurumsal sigorta portali. Özel DataTables sunucu taraflı filtreleme.',
      longDesc: 'Bilgi Birikim Sistemleri bünyesinde Bupa Acıbadem Sigorta için geliştirilen kurumsal web portali. ASP.NET Boilerplate .NET 9 MVC mimarisi kullanıldı. Veritabanı tasarımına ve mimari kararlara katkı sağlandı. jQuery DataTables için native destekten yoksun olan sunucu taraflı filtreleme özel olarak geliştirildi.',
      tags: ['Asp.Net Boilerplate', '.NET 9', 'MVC', 'jQuery', 'MSSQL', 'Kendo UI'],
      github: null,
      live: null,
      color: '#e11d48',
      status: 'Tamamlandı',
      type: 'Enterprise',
      client: 'Bupa Acıbadem Sigorta',
      highlights: [
        'ASP.NET Boilerplate .NET 9 MVC ile kurumsal portal mimarisi',
        'Veritabanı tasarımı ve mimari kararlara katkı',
        'jQuery DataTables için özel sunucu taraflı filtreleme çözümü',
        'Sigorta iş kurallara göre özelleştirilmiş arka plan işlemleri',
      ],
    },
    {
      title: 'Teknosa Müşteri Portali',
      shortDesc: 'ASP.NET Boilerplate ve CRM on-premise entegrasyonu ile müşteri portali.',
      longDesc: 'Teknosa için ASP.NET Boilerplate altyapısıyla geliştirilen müşteri portali. CRM on-premise sistemi ile iki yönlü entegrasyon sağlandı. Müşteri verilerinin yönetimi ve iş akışı otomasyonu iyileştirildi.',
      tags: ['Asp.Net Boilerplate', '.NET', 'MVC', 'CRM', 'MSSQL', 'Bootstrap'],
      github: null,
      live: null,
      color: '#8b5cf6',
      status: 'Tamamlandı',
      type: 'Enterprise',
      client: 'Teknosa',
      highlights: [
        'ASP.NET Boilerplate ile kurumsal portal geliştirme',
        'CRM on-premise ile iki yönlü entegrasyon',
        'Ldap ile kullanıcı doğrulama ve yetkilendirme',
        'Kendo UI ile zenginleştirilmiş kullanıcı arayüzü',
      ],
    },
    {
      title: 'Portfolio Website',
      shortDesc: 'Bu site! React + Vite + GSAP ile modern, animasyonlu kişisel portfolio.',
      longDesc: 'React ve Vite teknolojisi üzerine kurulu, GSAP ScrollTrigger animasyonları içeren kişisel portfolio sitesi. TR/EN dil desteği, mobil uyumlu tasarım ve modern dark tema ile hazırlanmıştır.',
      tags: ['React', 'Vite', 'GSAP', 'CSS3', 'JavaScript'],
      github: 'https://github.com/furkanpasaoglu',
      live: '#',
      color: '#a78bfa',
      status: 'Yayında',
      type: 'Frontend',
      highlights: [
        'GSAP ScrollTrigger ile scroll bazlı animasyonlar',
        'Türkçe / İngilizce dil desteği',
        'Loading screen ve sayfa geçiş animasyonları',
        'Proje detay slide panel',
        'Tamamen responsive tasarım',
      ],
    },
  ],
  en: [
    {
      title: 'RentACar — Angular + .NET',
      shortDesc: 'Car rental system. Angular frontend, .NET Core backend, JWT auth.',
      longDesc: 'An enterprise car rental application built with N-Tier Architecture. Features a modern Angular frontend and a robust .NET Core backend with JWT-based authentication, role management, and payment integration.',
      tags: ['Angular', 'TypeScript', '.NET Core', 'Entity Framework', 'JWT', 'MSSQL'],
      github: 'https://github.com/furkanpasaoglu/RentACar-Angular',
      live: null,
      color: '#dd0031',
      status: 'Completed',
      type: 'Full-Stack',
      highlights: [
        '29 GitHub stars — a community-recognized open source project',
        'N-Tier Architecture — Business, DataAccess, Entities, Core layers',
        'JWT-based auth with interceptor-managed token handling',
        'Full CRUD for vehicles, categories, brands, and users',
        'Comprehensive backend validation with FluentValidation',
      ],
    },
    {
      title: 'ReCapProject — .NET Backend',
      shortDesc: 'Car rental backend service built with Clean Architecture principles.',
      longDesc: 'A comprehensive car rental backend project implementing Layered Architecture principles in .NET. Includes enterprise patterns like Autofac IoC, Aspect-Oriented Programming, and interceptors.',
      tags: ['.NET', 'C#', 'Autofac', 'AOP', 'Entity Framework', 'MSSQL', 'JWT'],
      github: 'https://github.com/furkanpasaoglu/ReCapProject',
      live: null,
      color: '#7c6fff',
      status: 'Completed',
      type: 'Backend',
      highlights: [
        '20 GitHub stars — widely referenced as a learning project',
        'Autofac IoC container for dependency management',
        'AOP — separating cross-cutting concerns like Validation, Logging, Auth',
        'Caching and Transaction interceptors',
        'Memory Cache and JWT integration',
      ],
    },
    {
      title: 'eShopping — Microservices',
      shortDesc: 'Event-driven e-commerce platform. Microservice architecture, RabbitMQ, Docker.',
      longDesc: 'An e-commerce platform built on modern microservice architecture. Each service is independently deployable. Uses RabbitMQ for event-driven communication and Docker Compose for container orchestration.',
      tags: ['.NET', 'C#', 'Microservices', 'RabbitMQ', 'Docker', 'API Gateway', 'Redis'],
      github: 'https://github.com/furkanpasaoglu/eShopping',
      live: null,
      color: '#00d4ff',
      status: 'In Progress',
      type: 'Microservices',
      highlights: [
        'Event-driven architecture — async messaging with RabbitMQ',
        'Centralized request management with Ocelot API Gateway',
        'Independent services — Catalog, Basket, Order, Identity',
        'Docker Compose for full environment with a single command',
        'Repository Pattern and CQRS readiness',
      ],
    },
    {
      title: 'Pirelli — PHP to C# Migration',
      shortDesc: 'Full system rewrite from PHP to C#/.NET Clean Architecture with Identity Server integration.',
      longDesc: 'A comprehensive system migration for Pirelli carried out at Bilgi Birikim Sistemleri. The legacy PHP infrastructure was rebuilt on C# / .NET using Clean Architecture and CQRS principles. Identity Server was integrated for secure user authentication.',
      tags: ['C#', '.NET Core', 'Clean Architecture', 'CQRS', 'Identity Server', 'MSSQL'],
      github: null,
      live: null,
      color: '#ff6b35',
      status: 'Completed',
      type: 'Enterprise',
      client: 'Pirelli',
      highlights: [
        'Successfully migrated PHP system to C# / .NET Clean Architecture',
        'CQRS for segregated read/write operations',
        'Identity Server for secure user authentication',
        'Scalable and maintainable architecture design',
      ],
    },
    {
      title: 'Turkiye Petrolleri & Derimod — CRM',
      shortDesc: 'Customer management modernization. Asp.Net Boilerplate, Kendo UI, SAP & REST/SOAP integration.',
      longDesc: 'Modernized the customer management system for Türkiye Petrolleri & Enerjisa using Asp.Net Boilerplate and Kendo UI, with REST/SOAP API and SAP integrations. Built a campaign management system and .NET Core Web APIs for Derimod, including Windows services.',
      tags: ['.NET Core', 'Asp.Net Boilerplate', 'Kendo UI', 'SAP', 'REST API', 'MSSQL'],
      github: null,
      live: null,
      color: '#10b981',
      status: 'Completed',
      type: 'Enterprise',
      client: 'Türkiye Petrolleri / Derimod',
      highlights: [
        'Customer management modernization with Asp.Net Boilerplate',
        'REST and SOAP API integrations',
        'SAP system integration',
        'Performance improvements and Kendo UI interface',
        'Campaign management system and Windows service for Derimod',
      ],
    },
    {
      title: 'Allianz CRM & Dynamics 365 Integrations',
      shortDesc: 'CRM integrations with Twitter, YouTube, Google Play, and Microsoft Dynamics 365.',
      longDesc: 'Integrated Twitter, YouTube, and Google Play data into the Allianz CRM system. Delivered Microsoft Dynamics 365 CRM integrations for Karaca, FlyingTiger, Jumbo, and SharkAndNinja, improving customer data management and automation.',
      tags: ['Microsoft Dynamics 365', 'C#', '.NET', 'REST API', 'OAuth2', 'MSSQL'],
      github: null,
      live: null,
      color: '#f59e0b',
      status: 'Completed',
      type: 'Enterprise',
      client: 'Allianz / Karaca / Jumbo / SharkAndNinja / FlyingTiger',
      highlights: [
        'Twitter, YouTube, Google Play integration into Allianz CRM',
        'Microsoft Dynamics 365 CRM for Karaca, FlyingTiger, Jumbo, SharkAndNinja',
        'Customer data management and automation improvements',
        'OAuth2 authentication and third-party API integration',
        'REST API development with .NET Core',
      ],
    },
    {
      title: 'Bupa Acıbadem Insurance Portal',
      shortDesc: 'Enterprise insurance portal with ASP.NET Boilerplate (.NET 9 MVC). Custom DataTables server-side filtering.',
      longDesc: 'An enterprise web portal developed for Bupa Acıbadem Insurance at Bilgi Birikim Sistemleri. Built with ASP.NET Boilerplate .NET 9 MVC architecture. Contributed to database design and architectural decisions. Engineered a custom server-side filtering solution for jQuery DataTables where native support was unavailable.',
      tags: ['Asp.Net Boilerplate', '.NET 9', 'MVC', 'jQuery', 'MSSQL', 'Kendo UI'],
      github: null,
      live: null,
      color: '#e11d48',
      status: 'Completed',
      type: 'Enterprise',
      client: 'Bupa Acıbadem Sigorta',
      highlights: [
        'ASP.NET Boilerplate .NET 9 MVC enterprise portal architecture',
        'Contributed to database design and architectural decisions',
        'Engineered custom server-side filtering for jQuery DataTables',
        'Custom background processing tailored to insurance business rules',
      ],
    },
    {
      title: 'Teknosa Customer Portal',
      shortDesc: 'Customer portal with ASP.NET Boilerplate and CRM on-premise integration.',
      longDesc: 'A customer portal developed for Teknosa using ASP.NET Boilerplate. Bidirectional integration with CRM on-premise system. Improved customer data management and business workflow automation.',
      tags: ['Asp.Net Boilerplate', '.NET', 'MVC', 'CRM', 'MSSQL', 'Bootstrap'],
      github: null,
      live: null,
      color: '#8b5cf6',
      status: 'Completed',
      type: 'Enterprise',
      client: 'Teknosa',
      highlights: [
        'Enterprise portal development with ASP.NET Boilerplate',
        'Bidirectional CRM on-premise integration',
        'Ldap authentication and authorization',
        'Rich user interface with Kendo UI'
      ],
    },
    {
      title: 'Portfolio Website',
      shortDesc: 'This site! Personal portfolio built with React + Vite + GSAP.',
      longDesc: 'A personal portfolio site built with React and Vite, featuring GSAP ScrollTrigger animations. Includes TR/EN language support, mobile-responsive design, and a modern dark theme.',
      tags: ['React', 'Vite', 'GSAP', 'CSS3', 'JavaScript'],
      github: 'https://github.com/furkanpasaoglu',
      live: '#',
      color: '#a78bfa',
      status: 'Live',
      type: 'Frontend',
      highlights: [
        'Scroll-triggered animations with GSAP ScrollTrigger',
        'Turkish / English language support',
        'Loading screen and page transition animations',
        'Project detail slide panel',
        'Fully responsive design',
      ],
    },
  ],
};

export default function Projects() {
  const sectionRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { t, lang } = useLang();

  const projects = projectsData[lang] || projectsData.tr;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.projects-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo('.project-card', { y: 70, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7,
        stagger: { amount: 0.6, from: 'start' }, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.projects-grid'),
          start: 'top 85%', toggleActions: 'play none none reverse'
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="projects" className="projects-section" ref={sectionRef}>
        <div className="container">
          <div className="projects-header">
            <span className="section-tag">{t.projects.tag}</span>
            <h2 className="section-title">{t.projects.title}</h2>
            <p className="section-desc">{t.projects.desc}</p>
          </div>

          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.title}
                className="project-card"
                style={{ '--card-color': project.color }}
                onClick={() => setSelectedProject(project)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
              >
                <div className="card-glow" />
                <div className="card-body">
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className="card-type" style={{ color: project.color }}>{project.type}</span>
                  {project.client && (
                    <span className="card-client"><FiUsers /> {project.client}</span>
                  )}
                      <h3 className="card-title">{project.title}</h3>
                    </div>
                    <div className="card-links" onClick={(e) => e.stopPropagation()}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                          <FiGithub />
                        </a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noreferrer" aria-label="Live">
                          <FiExternalLink />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="card-desc">{project.shortDesc}</p>
                  <div className="card-tags">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="card-tag">{tag}</span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="card-tag card-tag-more">+{project.tags.length - 4}</span>
                    )}
                  </div>
                  <div className="card-detail-hint">
                    <span>Detaylar</span> <FiArrowUpRight />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="projects-footer">
            <a href="https://github.com/furkanpasaoglu" target="_blank" rel="noreferrer" className="btn btn-outline">
              <FiGithub /> {t.projects.viewGithub}
            </a>
          </div>
        </div>
      </section>

      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
