import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiArrowDown, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useLang } from '../context/LanguageContext';
import './Hero.css';

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const socialRef = useRef(null);
  const bgRef = useRef(null);
  const scrollRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(bgRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }
    )
    .fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=1.2')
    .fromTo(subtitleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .fromTo(ctaRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .fromTo(socialRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .fromTo(scrollRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');

    gsap.to(scrollRef.current, { y: 8, duration: 1.4, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: 2 });

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      gsap.to(bgRef.current, { x, y, duration: 1.5, ease: 'power1.out' });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-bg" ref={bgRef}>
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content container">
        <h1 className="hero-title" ref={titleRef}>
          <span className="hero-greeting">{t.hero.greeting}</span>
          <span className="hero-name">{t.hero.name}</span>
        </h1>

        <h2 className="hero-subtitle" ref={subtitleRef}>
          <span className="typing-cursor">{t.hero.subtitle}</span>
        </h2>

        <p className="hero-desc" ref={descRef}>{t.hero.desc}</p>

        <div className="hero-cta" ref={ctaRef}>
          <a href="#projects" className="btn btn-primary">
            {t.hero.cta1} <FiArrowDown />
          </a>
          <a href="#contact" className="btn btn-outline">
            {t.hero.cta2}
          </a>
        </div>

        <div className="hero-social" ref={socialRef}>
          <a href="https://github.com/furkanpasaoglu" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FiGithub />
          </a>
          <a href="https://www.linkedin.com/in/furkanpasaoglu/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FiLinkedin />
          </a>
          <a href="mailto:furkan.pasaoglu99@gmail.com" aria-label="Email">
            <FiMail />
          </a>
        </div>
      </div>

      <div className="hero-scroll-indicator" ref={scrollRef}>
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
