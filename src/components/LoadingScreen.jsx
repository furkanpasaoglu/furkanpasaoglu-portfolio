import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../context/LanguageContext';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const textRef = useRef(null);
  const logoRef = useRef(null);
  const progressBarRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const el = containerRef.current;
    const counter = counterRef.current;
    const lines = t.loading.lines;

    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        gsap.to(el, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          onComplete,
        });
      },
    });

    // Animate all particles
    gsap.utils.toArray('.ls-particle').forEach((p, i) => {
      gsap.fromTo(p,
        { scale: 0, opacity: 0, rotation: 0 },
        {
          scale: 1,
          opacity: gsap.utils.random(0.2, 0.7),
          rotation: gsap.utils.random(-180, 180),
          duration: gsap.utils.random(1.5, 2.5),
          delay: gsap.utils.random(0, 0.5),
          ease: 'elastic.out(1, 0.5)',
          yoyo: true,
          repeat: -1,
          repeatDelay: gsap.utils.random(0.5, 2),
        }
      );
      gsap.to(p, {
        x: `+=${gsap.utils.random(-30, 30)}`,
        y: `+=${gsap.utils.random(-30, 30)}`,
        duration: gsap.utils.random(3, 6),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

    // Animate rings
    gsap.utils.toArray('.ls-ring').forEach((ring, i) => {
      gsap.to(ring, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 8 + i * 3,
        ease: 'none',
        repeat: -1,
      });
      gsap.fromTo(ring,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.1 * i, ease: 'back.out(1.5)' }
      );
    });

    // Logo entrance
    tl.fromTo(logoRef.current,
      { scale: 0, opacity: 0, rotation: -30 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' },
      0.3
    );

    // Counter + text
    let count = { val: 0 };
    let lineIndex = 0;

    tl.to(count, {
      val: 100,
      duration: 3.2,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(count.val);
        if (counter) counter.textContent = `${v}%`;

        // Update progress bar
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${v}%`;
        }

        // Cycle loading text
        const newIndex = Math.floor(v / (100 / lines.length));
        if (newIndex !== lineIndex && newIndex < lines.length && textRef.current) {
          lineIndex = newIndex;
          gsap.to(textRef.current, {
            opacity: 0, y: -10, duration: 0.2,
            onComplete: () => {
              if (textRef.current) {
                textRef.current.textContent = lines[lineIndex];
                gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.2 });
              }
            }
          });
        }
      },
    }, 0.5);

    return () => {
      gsap.killTweensOf(el);
    };
  }, [onComplete, t]);

  return (
    <div className="loading-screen" ref={containerRef}>
      {/* Animated rings */}
      <div className="ls-rings">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`ls-ring ls-ring-${i + 1}`} />
        ))}
      </div>

      {/* Floating particles */}
      <div className="ls-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="ls-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--accent-alt)' : '#a78bfa',
              borderRadius: i % 2 === 0 ? '50%' : '3px',
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="ls-center">
        <div className="ls-logo" ref={logoRef}>
          <span className="ls-bracket">&lt;</span>
          FP
          <span className="ls-bracket">/&gt;</span>
        </div>

        <div className="ls-counter" ref={counterRef}>0%</div>

        <div className="ls-progress-track">
          <div className="ls-progress-fill" ref={progressBarRef} />
        </div>

        <p className="ls-text" ref={textRef}>{t.loading.lines[0]}</p>
      </div>
    </div>
  );
}
