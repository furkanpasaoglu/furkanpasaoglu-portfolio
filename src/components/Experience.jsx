import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiBriefcase, FiBookOpen, FiArrowUpRight } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import ExperiencePanel from './ExperiencePanel';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const experienceData = {
  tr: [
    {
      icon: <FiBriefcase />,
      isEducation: false,
      title: 'Senior Software Developer',
      company: 'Bilgi Birikim Sistemleri',
      period: '06/2021 — Günümüz',
      type: 'Full-time',
      desc: 'ASP.NET MVC, Bootstrap, jQuery ve Kendo UI ile kurumsal web uygulamaları geliştirme. .NET Core/Framework ile RESTful API tasarımı. Microsoft Dynamics 365 CRM entegrasyonları. Clean Architecture ve ASP.NET Boilerplate ile sürdürülebilir sistemler. Azure DevOps ve Jenkins ile CI/CD yönetimi.',
      tech: ['.NET Core', 'C#', 'Asp.Net Boilerplate', 'Dynamics 365', 'Kendo UI', 'MSSQL', 'SAP', 'Redis', 'Jenkins', 'Azure DevOps'],
      highlights: [
        'Bupa Acıbadem Sigorta Portali — ASP.NET Boilerplate (.NET 9 MVC), jQuery DataTables için özel server-side filtreleme çözümü geliştirdim',
        'Teknosa müşteri portali — ASP.NET Boilerplate ve CRM on-premise entegrasyonu',
        'Derimod — kampanya yönetim sistemi, Windows servisleri, Web API ve Console uygulamaları geliştirdim',
        'Karaca Türkiye, SharkNinja, Karaca UK, Karaca Germany, Jumbo, Flying Tiger — Hangfire background job’ları dahil Web API ve Windows servisleri',
        'Allianz CRM’e Twitter, YouTube ve Google Play entegrasyonu',
        'Türk Hava Yolları, Paşabahçe, Pirelli, Panasonic, MNG Kargo dahil 30+ projede görev aldım',
        'Microsoft Certified: Power Platform Developer Associate sertifikası',
      ],
    },
    {
      icon: <FiBookOpen />,
      isEducation: true,
      title: 'Senior Software Developer Bootcamp',
      company: 'Kodlama.io & Techcareer.net',
      period: '2021',
      type: 'Eğitim',
      desc: 'Kodlama.io Senior Software Developer Bootcamp (C# & .NET) ve Techcareer.net Senior Queue Systems Proficiency Bootcamp tamamlandı. Clean Architecture, CQRS, Microservices ve RabbitMQ konularında ileri seviye eğitim.',
      tech: ['C#', '.NET', 'Clean Architecture', 'CQRS', 'Microservices', 'RabbitMQ', 'Angular'],
      highlights: [
        'Kodlama.io C# & Angular Developer Bootcamp tamamlandı',
        'Kodlama.io Senior Software Developer Bootcamp tamamlandı',
        'Techcareer.net Senior Queue Systems Proficiency Bootcamp tamamlandı',
        'Clean Architecture, CQRS ve DDD konularında ileri seviye eğitim',
        'Microservices, RabbitMQ ve event-driven architecture çalışmaları',
      ],
    },
    {
      icon: <FiBookOpen />,
      isEducation: true,
      title: 'Bilgisayar Programcılığı',
      company: 'Kocaeli Üniversitesi',
      period: '09/2018 — 07/2020',
      type: 'Eğitim',
      desc: 'Bilgisayar Programcılığı ön lisans programını 3.48 GPA ile tamamladım. Yazılım geliştirme temellerini, veritabanı yönetimini ve web programlamayı öğrendim.',
      tech: ['C#', 'SQL', 'Web Programlama', 'OOP', 'Veritabanı Yönetimi'],
      highlights: [
        '3.48 GPA ile mezuniyet',
        'C#, OOP ve veritabanı yönetimi temelleri',
        'Web programlama ve SQL pratiği',
        'Anadolu Üniversitesi Yönetim Bilişim Sistemleri lisansına devam ediyorum',
      ],
    },
  ],
  en: [
    {
      icon: <FiBriefcase />,
      isEducation: false,
      title: 'Senior Software Developer',
      company: 'Bilgi Birikim Sistemleri',
      period: '06/2021 — Present',
      type: 'Full-time',
      desc: 'Developed enterprise web applications with ASP.NET MVC, Bootstrap, jQuery, and Kendo UI. Designed RESTful APIs with .NET Core/Framework. Integrated Microsoft Dynamics 365 CRM with third-party services. Built maintainable systems with Clean Architecture and ASP.NET Boilerplate. Managed CI/CD pipelines with Azure DevOps and Jenkins.',
      tech: ['.NET Core', 'C#', 'Asp.Net Boilerplate', 'Dynamics 365', 'Kendo UI', 'MSSQL', 'SAP', 'Redis', 'Jenkins', 'Azure DevOps'],
      highlights: [
        'Bupa Acıbadem Insurance Portal — ASP.NET Boilerplate (.NET 9 MVC), designed custom server-side filtering for jQuery DataTables',
        'Teknosa customer portal — ASP.NET Boilerplate with CRM on-premise integration',
        'Derimod — campaign management system, Windows services, Web APIs, and Console applications',
        'Karaca Turkey, SharkNinja, Karaca UK/Germany, Jumbo, Flying Tiger — Web APIs and Windows services with Hangfire background jobs',
        'Integrated Twitter, YouTube, and Google Play into Allianz CRM',
        'Contributed to 30+ projects including Turkish Airlines, Paşabahçe, Pirelli, Panasonic, MNG Kargo',
        'Microsoft Certified: Power Platform Developer Associate',
      ],
    },
    {
      icon: <FiBookOpen />,
      isEducation: true,
      title: 'Senior Software Developer Bootcamp',
      company: 'Kodlama.io & Techcareer.net',
      period: '2021',
      type: 'Training',
      desc: 'Completed Kodlama.io Senior Software Developer Bootcamp (C# & .NET) and Techcareer.net Senior Queue Systems Proficiency Bootcamp. Advanced training on Clean Architecture, CQRS, Microservices, and RabbitMQ.',
      tech: ['C#', '.NET', 'Clean Architecture', 'CQRS', 'Microservices', 'RabbitMQ', 'Angular'],
      highlights: [
        'Completed Kodlama.io C# & Angular Developer Bootcamp',
        'Completed Kodlama.io Senior Software Developer Bootcamp',
        'Completed Techcareer.net Senior Queue Systems Proficiency Bootcamp',
        'Advanced training in Clean Architecture, CQRS, and DDD',
        'Hands-on practice with Microservices, RabbitMQ, and event-driven architecture',
      ],
    },
    {
      icon: <FiBookOpen />,
      isEducation: true,
      title: 'Computer Programming',
      company: 'Kocaeli University',
      period: '09/2018 — 07/2020',
      type: 'Education',
      desc: 'Completed an associate degree in Computer Programming with a 3.48 GPA. Gained a solid foundation in software development, database management, and web programming.',
      tech: ['C#', 'SQL', 'Web Programming', 'OOP', 'Database Management'],
      highlights: [
        'Graduated with 3.48 GPA',
        'Foundations of C#, OOP, and database management',
        'Web programming and SQL practice',
        'Currently pursuing a Bachelor\'s at Anadolu University (Management Information Systems)',
      ],
    },
  ],
};

export default function Experience() {
  const sectionRef = useRef(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const { t, lang } = useLang();
  const experiences = experienceData[lang] || experienceData.tr;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current.querySelector('.exp-header');
      gsap.fromTo(header, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 82%', toggleActions: 'play none none reverse' }
      });

      const line = sectionRef.current.querySelector('.timeline-line');
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, duration: 1.5, ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current.querySelector('.timeline'),
          start: 'top 80%', end: 'bottom 20%', scrub: 1
        }
      });

      sectionRef.current.querySelectorAll('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item, { x: i % 2 === 0 ? -50 : 50, opacity: 0 }, {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 83%', toggleActions: 'play none none reverse' }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [lang]);

  return (
    <>
    <section id="experience" className="experience-section" ref={sectionRef}>
      <div className="container">
        <div className="exp-header">
          <span className="section-tag">{t.experience.tag}</span>
          <h2 className="section-title">{t.experience.title}</h2>
          <p className="section-desc">{t.experience.desc}</p>
        </div>

        <div className="timeline">
          <div className="timeline-line" />
          {experiences.map((exp, i) => (
            <div
              key={i}
              className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}${exp.isEducation ? ' edu' : ''}`}
              onClick={() => setSelectedExp(exp)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedExp(exp)}
              style={{ cursor: 'pointer' }}
            >
              <div className="timeline-dot">{exp.icon}</div>
              <div className="timeline-card">
                <div className="timeline-meta">
                  <span className="timeline-period">{exp.period}</span>
                  <span className={`timeline-type${!exp.isEducation ? ' type-work' : ''}`}>{exp.type}</span>
                </div>
                <h3 className="timeline-title">{exp.title}</h3>
                <span className="timeline-company">{exp.company}</span>
                <p className="timeline-desc">{exp.desc}</p>
                <div className="timeline-tech">
                  {exp.tech.map((t) => (
                    <span key={t} className="card-tag">{t}</span>
                  ))}
                </div>
                <div className="timeline-detail-hint">
                  <span>{lang === 'tr' ? 'Detaylar' : 'Details'}</span> <FiArrowUpRight />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {selectedExp && (
      <ExperiencePanel exp={selectedExp} onClose={() => setSelectedExp(null)} />
    )}
    </>
  );
}
