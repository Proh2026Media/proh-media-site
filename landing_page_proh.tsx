import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, CheckCircle2, Sparkles, Loader2, Menu, X, ChevronDown,
  Compass, Fingerprint, PenLine, TrendingUp, MonitorSmartphone, HeartHandshake,
  Briefcase, UserRound, Landmark, HandHeart, MessageCircle,
} from 'lucide-react';

// --- LOGOS OFICIAIS (pasta /SVG) ---
import logoHeader from './SVG/proh-black.svg';
import logoFooter from './SVG/proh-white-off.svg';

// --- CONFIGURAÇÃO ---
// WhatsApp que recebe os projetos do formulário (somente dígitos, com DDI).
const WHATSAPP_NUMBER = '5519995951316';
// Redes sociais: preencha as URLs para os links aparecerem no rodapé.
const SOCIAL = { instagram: '', linkedin: '' };

// --- CONFIGURAÇÃO DO SIMULADOR DE IA ---
// A chave da API NÃO fica no site: o front chama /api/gemini.php (proxy no
// próprio servidor da Hostinger, que guarda a chave fora da pasta pública).
// Em desenvolvimento, defina VITE_GEMINI_PROXY_URL no .env.local apontando
// para o site publicado (ex.: https://proh.media/api/gemini.php).
const geminiProxyUrl = (import.meta as any).env?.VITE_GEMINI_PROXY_URL ?? "/api/gemini.php";

// --- CORES OFICIAIS DA MARCA (Plataforma PROH) ---
// Preto:     #0F0F15
// Off-white: #D8D4BD
// Branco:    #FFFFFF
// Tipografia: Mirano Extended (personalidade — adicionar quando houver os
// arquivos) e Gotham (leitura e apoio — em uso em todo o site).

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerDark, setHeaderDark] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const themeSections = Array.from(document.querySelectorAll('section[id], footer'));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Qual seção está sob a pílula? (última no DOM que cobre o ponto,
      // pois as cartas posteriores ficam por cima). Tema pela cor de fundo.
      const probeY = 64;
      let dark = false;
      for (const el of themeSections) {
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.bottom > probeY) {
          dark = el.className.includes('bg-[#0F0F15]');
        }
      }
      setHeaderDark(dark);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Observer para menu ativo
    const observerOptions = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['hero', 'conceito', 'significado', 'dimensoes', 'solucoes', 'metodo', 'diferenciais', 'publicos', 'impacto', 'modelos', 'manifesto', 'faq', 'contato'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Observer para Animações de Scroll (Fade Up)
    const animObserverOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const animObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    };
    const animObserver = new IntersectionObserver(animObserverCallback, animObserverOptions);
    const animElements = document.querySelectorAll('.animate-on-scroll');
    animElements.forEach((el) => animObserver.observe(el));

    // Pilha de cartas: seções mais altas que a tela pinam pelo fundo
    // (top negativo), para nunca cortar a leitura.
    const stackCards = Array.from(document.querySelectorAll('.stack-card'));
    const setStackTops = () => {
      const vh = window.innerHeight;
      // Só no desktop (sticky). No mobile as cartas são position: relative,
      // e um top negativo as deslocaria visualmente.
      const desktop = window.matchMedia('(min-width: 768px)').matches;
      stackCards.forEach((el) => {
        el.style.top = desktop ? Math.min(0, vh - el.offsetHeight) + 'px' : '';
      });
    };
    setStackTops();
    window.addEventListener('resize', setStackTops);
    window.addEventListener('load', setStackTops);
    const stackRO = 'ResizeObserver' in window ? new ResizeObserver(setStackTops) : null;
    if (stackRO) stackCards.forEach((el) => stackRO.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setStackTops);
      window.removeEventListener('load', setStackTops);
      if (stackRO) stackRO.disconnect();
      observer.disconnect();
      animObserver.disconnect();
    };
  }, []);

  // Brilho do PROH em baixo-relevo: responde apenas à proximidade do
  // cursor (desktop). Nenhuma animação autônoma — parado, nada se move.
  useEffect(() => {
    const glass = document.querySelector('.glass-brand') as HTMLElement | null;
    if (!glass) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const secao = document.getElementById('conceito');
    const onMove = (e) => {
      const r = glass.getBoundingClientRect();
      const px = Math.min(Math.max(e.clientX, r.left), r.right);
      const py = Math.min(Math.max(e.clientY, r.top), r.bottom);
      const dist = Math.hypot(e.clientX - px, e.clientY - py);
      const intensidade = Math.max(0, 1 - dist / 260);
      glass.style.setProperty('--mo', intensidade.toFixed(3));
      if (intensidade > 0) {
        glass.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        glass.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      }
    };
    const onLeave = () => glass.style.setProperty('--mo', '0');
    if (secao) {
      secao.addEventListener('mousemove', onMove);
      secao.addEventListener('mouseleave', onLeave);
    }
    return () => {
      if (secao) {
        secao.removeEventListener('mousemove', onMove);
        secao.removeEventListener('mouseleave', onLeave);
      }
    };
  }, []);

  const navLinks = [
    { id: 'conceito', label: 'Conceito' },
    { id: 'solucoes', label: 'Soluções' },
    { id: 'metodo', label: 'Método' },
    { id: 'impacto', label: 'Impacto' },
    { id: 'contato', label: 'Contato' },
  ];

  return (
    <div className="text-[#0F0F15] bg-[#D8D4BD] selection:bg-[#0F0F15] selection:text-[#D8D4BD] overflow-x-hidden" style={{ fontFamily: "'Gotham', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; scroll-padding-top: 6.5rem; }
        * { -webkit-tap-highlight-color: transparent; }
        body { overflow-x: hidden; }
        .font-extended { font-family: 'Gotham', sans-serif; }
        .font-mirano { font-family: 'Mirano Extended', 'Gotham', sans-serif; }

        /* Destaque legível para palavras-chave sobre fundos claros */
        .mark-dark {
          background: #0F0F15;
          color: #D8D4BD;
          padding: 0 0.28em;
          border-radius: 0.35rem;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }

        /* Efeito Liquid Glass */
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .glass-panel-dark {
          background: rgba(15, 15, 21, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(216, 212, 189, 0.15);
        }
        .glass-panel-light {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(15, 15, 21, 0.05);
        }

        /* Linha do H — elemento proprietário: duas hastes (negócio e humano)
           conectadas pela PROH. Usada como divisor de seções. */
        .h-divider {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .h-divider::before, .h-divider::after {
          content: '';
          width: 3px;
          height: 2rem;
          background: currentColor;
          opacity: 0.9;
        }
        .h-divider span {
          height: 3px;
          width: 3.5rem;
          background: currentColor;
          opacity: 0.9;
        }

        /* Fotografia da marca: preto e branco para harmonizar com a paleta
           oficial; a cor volta suavemente na interação. */
        .img-brand {
          filter: grayscale(1);
          transition: filter 0.6s ease, transform 0.6s ease;
          object-fit: cover;
        }
        .img-brand:hover { filter: grayscale(0); }

        /* PROH em baixo-relevo: tom sobre tom, como relevo seco de
           papelaria premium. Estático — só um brilho sutil responde à
           proximidade do cursor (sem nenhuma animação autônoma). */
        .glass-brand {
          position: relative;
          width: min(100%, 34rem);
          aspect-ratio: 755 / 139;
          overflow: hidden;
          -webkit-mask-image: url('/brand/proh-glass.svg');
          mask-image: url('/brand/proh-glass.svg');
          -webkit-mask-size: contain; mask-size: contain;
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-position: left center; mask-position: left center;
          background: linear-gradient(180deg, #24242B 0%, #1B1B21 55%, #17171C 100%);
        }
        /* Fio de luz na borda superior: o relevo pegando a luz */
        .glass-brand::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, transparent 18%);
        }
        /* Clarão discreto que acompanha o cursor (desktop) */
        .glass-brand-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(220px 140px at var(--mx, 50%) var(--my, 50%),
            rgba(216, 212, 189, 0.16), transparent 75%);
          opacity: var(--mo, 0);
          transition: opacity 0.3s ease;
        }

        /* Pilha de cartas: cada seção pina (com top calculado via JS para
           seções mais altas que a tela) e a seguinte desliza por cima. */
        .stack-card { position: relative; }
        @media (min-width: 768px) {
          .stack-card { position: sticky; top: 0; }
        }

        /* Faixa com o sistema de mensagens da marca */
        .marquee { display: flex; overflow: hidden; }
        .marquee-track {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          animation: marquee-scroll 38s linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }

        /* Animações de Scroll (Fade & Slide) */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Delays para animações em cascata */
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }

        /* Loader Animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        /* Acessibilidade: respeita quem prefere menos movimento */
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .animate-on-scroll { opacity: 1 !important; transform: none !important; transition: none !important; }
          .animate-spin-slow { animation: none !important; }
          .marquee-track { animation: none !important; }
          .glass-brand-glow { transition: none !important; }
        }
      `}} />

      {/* HEADER: pílula flutuante que adapta o tema à seção sob ela */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 pt-4 md:pt-5">
        <div
          className={`max-w-6xl mx-auto border overflow-hidden transition-all duration-300 ${
            menuOpen ? 'rounded-[1.75rem]' : 'rounded-full'
          } ${
            headerDark
              ? 'bg-[#0F0F15]/85 backdrop-blur-xl shadow-lg border-white/10'
              : isScrolled || menuOpen
                ? 'bg-[#D8D4BD]/90 backdrop-blur-xl shadow-lg border-[#0F0F15]/10'
                : 'bg-[#D8D4BD]/65 backdrop-blur-md shadow-md border-white/50'
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-3">
            {/* Logo oficial: versão clara ou escura conforme o tema */}
            <div className="cursor-pointer transition-transform hover:scale-105 flex items-center shrink-0" onClick={() => { closeMenu(); window.scrollTo(0, 0); }}>
              <img src={headerDark ? logoFooter : logoHeader} alt="PROH Media" className="h-7 md:h-9 w-auto drop-shadow-sm" />
            </div>

            <nav className={`hidden lg:flex gap-8 text-sm font-bold tracking-wider uppercase font-extended transition-colors duration-300 ${headerDark ? 'text-[#D8D4BD]' : 'text-[#0F0F15]'}`}>
              {navLinks.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  className={`transition-all border-b-2 pb-0.5 ${activeSection === l.id ? (headerDark ? 'border-[#D8D4BD]' : 'border-[#0F0F15]') : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a href="#contato" className={`hidden lg:inline-flex whitespace-nowrap px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-full font-extended ${headerDark ? 'bg-[#D8D4BD] text-[#0F0F15] hover:bg-white' : 'bg-[#0F0F15] text-[#D8D4BD] hover:bg-white hover:text-[#0F0F15] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}>
                Começar um projeto
              </a>

              {/* Botão do menu mobile */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                className={`lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-300 ${headerDark ? 'text-[#D8D4BD] hover:bg-white/10' : 'text-[#0F0F15] hover:bg-[#0F0F15]/5'}`}
              >
                {menuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

          {/* Menu mobile: expande dentro da própria pílula. Animação por
              grid-template-rows (altura exata do conteúdo — sem o salto
              e o vazamento do max-height). */}
          <div className={`lg:hidden grid transition-[grid-template-rows] duration-300 ease-out ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <nav className="flex flex-col px-6 pb-6 pt-1">
                {navLinks.map((l) => (
                  <a key={l.id} href={`#${l.id}`} onClick={closeMenu} className={`py-4 text-lg font-bold uppercase tracking-wider font-extended border-b transition-colors duration-300 ${headerDark ? 'text-[#D8D4BD] border-white/10' : 'text-[#0F0F15] border-[#0F0F15]/10'}`}>{l.label}</a>
                ))}
                <a href="#contato" onClick={closeMenu} className={`mt-5 px-6 py-4 text-sm font-bold uppercase tracking-widest text-center rounded-full font-extended ${headerDark ? 'bg-[#D8D4BD] text-[#0F0F15]' : 'bg-[#0F0F15] text-[#D8D4BD]'}`}>
                  Começar um projeto
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* CARTAS SOBREPOSTAS: as quatro primeiras seções (a narrativa conceitual)
          usam md:sticky — cada uma gruda no topo e a seguinte desliza por cima.
          Da seção Soluções em diante, o fluxo volta ao normal. */}

      {/* SEÇÃO 1 — HERO */}
      <section id="hero" className="stack-card z-[10] w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#D8D4BD]">
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10 pt-28 pb-32 md:pt-32 md:pb-36 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center">
          <div className="max-w-4xl">
            <h2 className="text-[#0F0F15] font-bold uppercase tracking-widest text-xs sm:text-sm md:text-base mb-6 border-l-4 border-[#0F0F15] pl-4 font-extended animate-on-scroll">
              Estratégia, marca, mídia e impacto
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] mb-8 text-[#0F0F15] font-extended animate-on-scroll delay-100">
              O que tem valor<br />
              merece <span className="underline decoration-white decoration-[6px] underline-offset-8">alcançar mais.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-[#0F0F15]/80 max-w-2xl mb-10 font-medium leading-relaxed animate-on-scroll delay-200">
              A <Proh /> une branding, conteúdo, mídia e performance para transformar
              marcas, projetos e causas em presença, crescimento e impacto real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-on-scroll delay-300">
              <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#0F0F15] text-[#D8D4BD] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0F0F15] transition-all duration-300 rounded-full group font-extended w-full sm:w-fit shadow-lg hover:shadow-2xl">
                Quero propagar valor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#metodo" className="inline-flex items-center justify-center gap-2 border-2 border-[#0F0F15] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#0F0F15] hover:text-[#D8D4BD] transition-all duration-300 rounded-full font-extended w-full sm:w-fit">
                Conhecer nosso método
              </a>
            </div>
            <p className="mt-10 text-xs uppercase tracking-[0.3em] text-[#0F0F15]/50 font-bold font-mirano animate-on-scroll delay-400">
              PROH. Propagar valor.
            </p>
          </div>

          {/* Foto: apresentação de resultados — marketing e B2B com pessoas reais */}
          <div className="animate-on-scroll delay-300 relative">
            {/* Moldura deslocada: profundidade editorial */}
            <div className="absolute top-6 -bottom-4 -right-3 left-10 md:top-8 md:-bottom-6 md:-right-5 rounded-[2rem] md:rounded-[2.5rem] border-2 border-[#0F0F15]/15" aria-hidden="true"></div>
            <img
              src="https://images.unsplash.com/photo-1758691736490-03d39c292d7a?q=80&w=1200&auto=format&fit=crop"
              alt="Profissional apresentando gráficos de resultados para a equipe em uma reunião"
              loading="eager"
              className="img-brand relative w-full h-64 sm:h-80 lg:h-[30rem] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl"
            />
          </div>
        </div>

        {/* Faixa: sistema de mensagens da marca */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#D8D4BD] pt-4 pb-16" aria-hidden="true">
          <Marquee />
        </div>
      </section>

      {/* SEÇÃO 2 — O CONCEITO */}
      <section id="conceito" className="stack-card z-[20] w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 rounded-t-[2.5rem] md:rounded-t-[3rem] bg-[#0F0F15] text-[#D8D4BD] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2.5rem] md:mt-[-3rem]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll">
              <div className="glass-brand mb-8 select-none" aria-hidden="true">
                <div className="glass-brand-glow"></div>
              </div>
              <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-4"><span className="font-mirano">01</span><span className="w-8 h-[2px] bg-[#D8D4BD]/30" aria-hidden="true"></span>Conceito</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight font-extended">
                Propagar não é aparecer mais. É <span className="text-white">fazer sentido</span> para mais pessoas.
              </h2>
              <p className="text-base md:text-lg text-[#D8D4BD]/70 mb-6">
                Existem marcas, negócios e projetos que já possuem valor, mas ainda
                não conseguem demonstrá-lo com clareza.
              </p>
              <ul className="space-y-3 text-base md:text-lg text-[#D8D4BD]/70">
                <li className="flex items-start gap-3"><span className="mt-2.5 w-6 h-[2px] bg-[#D8D4BD]/40 shrink-0"></span>Entregam bem, mas parecem comuns.</li>
                <li className="flex items-start gap-3"><span className="mt-2.5 w-6 h-[2px] bg-[#D8D4BD]/40 shrink-0"></span>Geram impacto, mas não conseguem comunicá-lo.</li>
                <li className="flex items-start gap-3"><span className="mt-2.5 w-6 h-[2px] bg-[#D8D4BD]/40 shrink-0"></span>Produzem conteúdo, mas não constroem posicionamento.</li>
                <li className="flex items-start gap-3"><span className="mt-2.5 w-6 h-[2px] bg-[#D8D4BD]/40 shrink-0"></span>Investem em mídia, mas não possuem uma mensagem forte.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-6 animate-on-scroll delay-200">
            {/* Foto: rosto real — comunicação existe para fazer sentido para pessoas */}
            <img
              src="https://images.unsplash.com/photo-1704579924216-31ef96f7e008?q=80&w=1200&auto=format&fit=crop"
              alt="Retrato de uma mulher de cabelos cacheados sorrindo"
              loading="lazy"
              className="img-brand w-full h-52 md:h-64 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl"
            />
            <div className="glass-panel p-8 sm:p-10 md:p-14 border-l-4 border-[#D8D4BD] rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 font-extended">A <Proh /> existe para resolver essa distância</h3>
              <p className="text-lg md:text-xl font-medium leading-relaxed mb-8">
                Identificamos o valor presente em uma marca, damos forma à sua mensagem
                e criamos as condições para que ela alcance as pessoas certas e produza
                efeitos reais.
              </p>
              <p className="text-xl md:text-2xl font-black text-white font-mirano leading-snug">
                PROH é o nome.<br />Propagar é a missão.
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — O SIGNIFICADO */}
      <section id="significado" className="stack-card z-[30] w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">02</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>O significado</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight">
              Comunicação a favor do progresso, com o <span className="mark-dark">humano</span> no centro.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-12">
            {/* PRO */}
            <div className="glass-panel-light p-8 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll delay-100">
              <div className="text-5xl md:text-7xl font-black font-mirano mb-6 tracking-tighter">PRO</div>
              <p className="text-base md:text-lg leading-relaxed mb-6">
                Representa <strong>direção, progresso, propósito e construção</strong>.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-[#0F0F15]/70">
                É comunicação a favor do que precisa avançar: uma marca, um negócio,
                uma ideia, um projeto ou uma causa.
              </p>
            </div>

            {/* H */}
            <div className="glass-panel-dark text-[#D8D4BD] p-8 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-on-scroll delay-300">
              <div className="text-5xl md:text-7xl font-black font-mirano mb-6 tracking-tighter text-white">H</div>
              <p className="text-base md:text-lg leading-relaxed mb-6 text-[#D8D4BD]/90">
                Representa o <strong className="text-white">humano</strong> e o <strong className="text-white">hub</strong>.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-[#D8D4BD]/70">
                Pessoas estão no centro de toda decisão, enquanto conexões ampliam
                o alcance e transformam mensagens em movimentos.
              </p>
            </div>
          </div>

          <p className="text-lg md:text-2xl font-bold font-extended border-l-4 border-[#0F0F15] pl-5 max-w-3xl animate-on-scroll delay-400">
            <Proh /> transforma valor em percepção, presença, crescimento e impacto.
          </p>
        </div>
      </section>

      {/* SEÇÃO 4 — DUAS DIMENSÕES DO VALOR */}
      <section id="dimensoes" className="stack-card z-[40] w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">03</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Duas dimensões do valor</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter font-extended leading-tight">
              Resultado e humanidade não precisam caminhar <span className="mark-dark">separados</span>.
            </h2>
            <p className="text-lg md:text-xl text-[#0F0F15]/70">
              A comunicação pode gerar crescimento sem se tornar fria. Pode falar de
              impacto sem perder estratégia. Pode construir desejo sem abrir mão da
              responsabilidade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Valor de negócio */}
            <div className="bg-[#D8D4BD]/50 border border-[#0F0F15]/5 p-8 sm:p-10 md:p-14 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll delay-100">
              {/* Foto: performance na prática — painel de métricas e dados */}
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
                alt="Tela de laptop com painel de métricas e gráficos de desempenho"
                loading="lazy"
                className="img-brand w-full h-44 md:h-52 rounded-2xl shadow-lg mb-8"
              />
              <div className="bg-[#0F0F15] text-[#D8D4BD] w-16 h-16 flex items-center justify-center rounded-2xl mb-8 shadow-xl">
                <TrendingUp size={32} />
              </div>
              <p className="text-[#0F0F15]/60 uppercase text-sm font-bold mb-2 tracking-widest font-extended">Valor de negócio</p>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider font-extended">Propagar crescimento</h3>
              <p className="text-base md:text-lg mb-8 leading-relaxed">
                Organizamos marcas e campanhas para gerar:
              </p>
              <ul className="space-y-3">
                {['Posicionamento e autoridade', 'Demanda e vendas', 'Reputação e consistência', 'Percepção de valor'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#0F0F15] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 pt-6 border-t border-[#0F0F15]/10 font-bold">
                Resultado: marcas mais fortes, desejadas e sustentáveis.
              </p>
            </div>

            {/* Valor humano */}
            <div className="bg-[#0F0F15] text-[#D8D4BD] p-8 sm:p-10 md:p-14 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-on-scroll delay-300">
              {/* Foto: causa social real — educação e oportunidade */}
              <img
                src="https://images.unsplash.com/photo-1610500796385-3ffc1ae2f046?q=80&w=1000&auto=format&fit=crop"
                alt="Meninos lendo livros juntos em uma atividade educativa"
                loading="lazy"
                className="img-brand w-full h-44 md:h-52 rounded-2xl shadow-lg mb-8"
              />
              <div className="bg-[#D8D4BD] text-[#0F0F15] w-16 h-16 flex items-center justify-center rounded-2xl mb-8 shadow-xl">
                <HeartHandshake size={32} />
              </div>
              <p className="text-[#D8D4BD]/60 uppercase text-sm font-bold mb-2 tracking-widest font-extended">Valor humano</p>
              <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider font-extended">Propagar impacto</h3>
              <p className="text-base md:text-lg mb-8 leading-relaxed text-[#D8D4BD]/90">
                Construímos comunicação capaz de gerar:
              </p>
              <ul className="space-y-3">
                {['Conexão e confiança', 'Conscientização e mobilização', 'Oportunidades e pertencimento', 'Transformação'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#D8D4BD] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 pt-6 border-t border-[#D8D4BD]/10 font-bold text-white">
                Resultado: pessoas alcançadas e relações que permanecem.
              </p>
            </div>
          </div>

          <p className="text-base md:text-xl font-bold mt-12 border-l-4 border-[#0F0F15] pl-5 max-w-3xl animate-on-scroll delay-400">
            O resultado não precisa ser apenas um número. Ele também pode ser relevância.
          </p>
        </div>
      </section>

      {/* SEÇÃO 5 — SOLUÇÕES */}
      <section id="solucoes" className="stack-card z-[50] w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">04</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Soluções</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight mb-4">
              Tudo o que uma marca precisa para se posicionar, comunicar e crescer com coerência.
            </h2>
            <p className="text-lg md:text-xl text-[#0F0F15]/70">
              A <Proh /> integra diferentes competências em uma única direção estratégica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="animate-on-scroll delay-100"><SolutionCard icon={<Compass size={24} strokeWidth={1.5} />} title="Estratégia" desc="Direcionamento para compreender o cenário, organizar objetivos e definir os caminhos da comunicação." items={['Diagnóstico', 'Planejamento', 'Posicionamento', 'Proposta de valor']} /></div>
            <div className="animate-on-scroll delay-200"><SolutionCard icon={<Fingerprint size={24} strokeWidth={1.5} />} title="Marca" desc="Estrutura para transformar essência em uma identidade reconhecível e relevante." items={['Naming e branding', 'Identidade visual e verbal', 'Manifesto', 'Brandbook']} /></div>
            <div className="animate-on-scroll delay-300"><SolutionCard icon={<PenLine size={24} strokeWidth={1.5} />} title="Conteúdo" desc="Narrativas e formatos que constroem presença, relacionamento e autoridade." items={['Planejamento editorial', 'Social media', 'Roteiros e campanhas', 'Direção criativa']} /></div>
            <div className="animate-on-scroll delay-100"><SolutionCard icon={<TrendingUp size={24} strokeWidth={1.5} />} title="Mídia e performance" desc="Distribuição estratégica para aumentar alcance, demanda e conversão." items={['Tráfego pago', 'Funis e campanhas', 'Otimização', 'Dados e relatórios']} /></div>
            <div className="animate-on-scroll delay-200"><SolutionCard icon={<MonitorSmartphone size={24} strokeWidth={1.5} />} title="Digital" desc="Experiências que conectam marca, informação e conversão." items={['Sites e landing pages', 'Portais e interfaces', 'Automações', 'Apresentações digitais']} /></div>
            <div className="animate-on-scroll delay-300"><SolutionCard icon={<HeartHandshake size={24} strokeWidth={1.5} />} title="Impacto" desc="Comunicação para organizações e causas que desejam mobilizar pessoas e demonstrar transformação." items={['Campanhas sociais', 'Captação', 'Relatórios de impacto', 'Comunicação institucional']} /></div>
          </div>

          {/* SIMULADOR COM IA */}
          <div className="animate-on-scroll delay-400">
            <GeminiSimulator />
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — MÉTODO */}
      <section id="metodo" className="stack-card z-[60] w-full py-20 md:py-28 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-12 md:mb-16">
            <div className="animate-on-scroll">
              <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-4"><span className="font-mirano">05</span><span className="w-8 h-[2px] bg-[#D8D4BD]/30" aria-hidden="true"></span>Método</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight mb-4 text-white">
                Antes de propagar, é preciso dar direção.
              </h2>
              <p className="text-lg md:text-xl text-[#D8D4BD]/70">
                O Sistema <Proh /> organiza estratégia e execução em cinco movimentos.
              </p>
            </div>
            {/* Foto: bastidores de produção */}
            <img
              src="https://images.unsplash.com/photo-1632187981988-40f3cbaeef5e?q=80&w=1200&auto=format&fit=crop"
              alt="Equipe de produção reunida em volta de uma câmera nos bastidores"
              loading="lazy"
              className="img-brand w-full h-56 md:h-72 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-on-scroll delay-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="animate-on-scroll delay-100"><StepCard num="01" title="Origem" desc="Compreendemos a história, o contexto, o público, os objetivos e o valor real da organização." /></div>
            <div className="animate-on-scroll delay-200"><StepCard num="02" title="Forma" desc="Transformamos essência em posicionamento, identidade, mensagem e experiência." /></div>
            <div className="animate-on-scroll delay-300"><StepCard num="03" title="Voz" desc="Criamos narrativas, conteúdos e campanhas que tornam a marca reconhecível." /></div>
            <div className="animate-on-scroll delay-400"><StepCard num="04" title="Alcance" desc="Levamos a mensagem aos canais, públicos e oportunidades certas." /></div>
            <div className="animate-on-scroll delay-500"><StepCard num="05" title="Efeito" desc="Acompanhamos resultados, aprendizados, crescimento, reputação e impacto." /></div>
          </div>

          <div className="text-center animate-on-scroll delay-500">
            <p className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-white/80 font-extended mb-8">
              Origem <span className="text-[#D8D4BD]/40 mx-1">→</span> Forma <span className="text-[#D8D4BD]/40 mx-1">→</span> Voz <span className="text-[#D8D4BD]/40 mx-1">→</span> Alcance <span className="text-[#D8D4BD]/40 mx-1">→</span> Efeito
            </p>
            <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#D8D4BD] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 rounded-full group font-extended shadow-lg">
              Aplicar o Sistema <Proh />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — DIFERENCIAIS */}
      <section id="diferenciais" className="stack-card z-[70] w-full py-20 md:py-28 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">06</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Diferenciais</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight">
              Não entregamos peças isoladas. Construímos <span className="mark-dark">sistemas de propagação</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            <div className="animate-on-scroll delay-100"><Differential title="Estratégia antes da execução" desc="Cada projeto começa pela compreensão do que precisa ser percebido, por quem e com qual objetivo." /></div>
            <div className="animate-on-scroll delay-200"><Differential title="Marca e performance integradas" desc="Construímos reputação enquanto geramos alcance, demanda e conversão." /></div>
            <div className="animate-on-scroll delay-300"><Differential title="Sofisticação com clareza" desc="Criamos marcas premium sem recorrer a discursos complicados ou distantes." /></div>
            <div className="animate-on-scroll delay-100"><Differential title="Negócio e humano" desc="Entendemos indicadores, vendas e crescimento sem desconsiderar pessoas, relações e comunidades." /></div>
            <div className="animate-on-scroll delay-200"><Differential title="Impacto com dignidade" desc="Traduzimos causas sociais sem apelação, exploração ou narrativas artificiais." /></div>
            <div className="animate-on-scroll delay-300"><Differential title="Proximidade estratégica" desc="Participamos das decisões e não apenas da execução das peças." /></div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8 — PARA QUEM É A PROH */}
      <section id="publicos" className="stack-card z-[80] w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">07</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Para quem</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight">
              Trabalhamos com quem possui valor real e deseja comunicá-lo com mais direção.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="animate-on-scroll delay-100"><AudienceCard icon={<Briefcase size={24} strokeWidth={1.5} />} title="Empresas e marcas de serviço" desc="Para negócios que precisam aumentar percepção, autoridade e demanda." /></div>
            <div className="animate-on-scroll delay-200"><AudienceCard icon={<UserRound size={24} strokeWidth={1.5} />} title="Profissionais e lideranças" desc="Para especialistas, executivos e fundadores que desejam transformar conhecimento em influência." /></div>
            <div className="animate-on-scroll delay-100"><AudienceCard icon={<Landmark size={24} strokeWidth={1.5} />} title="Instituições e projetos sociais" desc="Para organizações que precisam mobilizar pessoas, captar recursos e demonstrar impacto." /></div>
            <div className="animate-on-scroll delay-200"><AudienceCard icon={<HandHeart size={24} strokeWidth={1.5} />} title="Empresas com responsabilidade social" desc="Para marcas que desejam comunicar ações e compromissos com credibilidade." /></div>
          </div>

          <div className="bg-white/60 border border-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll delay-300">
            <h3 className="text-lg font-bold uppercase tracking-widest font-extended mb-6">A <Proh /> é para quem:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
              {[
                'Entende comunicação como investimento',
                'Valoriza estratégia e consistência',
                'Deseja construir marca, não apenas publicar',
                'Busca crescimento com responsabilidade',
                'Está aberto a processos, dados e direcionamento',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#0F0F15] shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SEÇÃO 9 — IMPACTO */}
      <section id="impacto" className="stack-card z-[90] w-full py-20 md:py-28 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll">
              <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-4"><span className="font-mirano">08</span><span className="w-8 h-[2px] bg-[#D8D4BD]/30" aria-hidden="true"></span>Impacto</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight mb-6 text-white">
                Propósito também precisa de estratégia.
              </h2>
              <p className="text-base md:text-lg text-[#D8D4BD]/70 mb-6">
                Projetos sociais não devem depender apenas de boas intenções. Para
                alcançar pessoas, parceiros, patrocinadores e apoiadores, uma causa
                precisa de clareza, posicionamento, narrativa, identidade, evidências,
                confiança, distribuição e continuidade.
              </p>
              <p className="text-base md:text-lg text-[#D8D4BD]/70 mb-8">
                A <Proh /> aplica o mesmo padrão estratégico e criativo utilizado no
                mercado para fortalecer organizações e iniciativas de impacto.
              </p>
              <ul className="space-y-3 mb-10">
                {['Sem reduzir pessoas a histórias de sofrimento', 'Sem comunicação apelativa', 'Sem perder humanidade'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#D8D4BD] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#D8D4BD] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 rounded-full group font-extended shadow-lg">
                Propagar uma causa
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="flex flex-col gap-6 animate-on-scroll delay-200">
              {/* Foto: comunidade real — participação e pertencimento */}
              <img
                src="https://images.unsplash.com/photo-1694286068561-3233c946e9be?q=80&w=1200&auto=format&fit=crop"
                alt="Crianças reunidas em uma atividade comunitária ao ar livre"
                loading="lazy"
                className="img-brand w-full h-56 md:h-72 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl"
              />
              <div className="glass-panel p-8 sm:p-10 md:p-14 border-l-4 border-[#D8D4BD] rounded-[2rem] md:rounded-[2.5rem]">
                <p className="text-2xl md:text-4xl font-black text-white font-extended leading-snug">
                  Causas relevantes também merecem marcas fortes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 10 — MODELOS DE PARCERIA */}
      <section id="modelos" className="stack-card z-[100] w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">09</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Modelos de parceria</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight">
              Diferentes formas de começar. Uma mesma direção.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="animate-on-scroll delay-100"><ModelCard title="Projetos estratégicos" desc="Para demandas com escopo e entrega definidos." items={['Branding e naming', 'Site', 'Reposicionamento', 'Campanhas']} /></div>
            <div className="animate-on-scroll delay-200"><ModelCard title="Parceria recorrente" desc="Para quem precisa de comunicação contínua." items={['Estratégia', 'Social media', 'Conteúdo e mídia', 'Relatórios']} /></div>
            <div className="animate-on-scroll delay-300"><ModelCard title="Sprint de propagação" desc="Para objetivos concentrados e períodos específicos." items={['Lançamentos', 'Eventos', 'Campanhas', 'Captação']} /></div>
            <div className="animate-on-scroll delay-400"><ModelCard title="Consultoria e direção" desc="Para equipes internas que precisam de orientação." items={['Planejamento', 'Governança de marca', 'Processos', 'Direção de fornecedores']} /></div>
          </div>

          <div className="text-center animate-on-scroll delay-400">
            <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#0F0F15] text-[#D8D4BD] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0F0F15] transition-all duration-300 rounded-full group font-extended shadow-lg">
              Encontrar o modelo ideal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 11 — MANIFESTO */}
      <section id="manifesto" className="stack-card z-[110] w-full py-24 md:py-32 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-20 items-start">
            {/* Coluna fixa: título e assinatura */}
            <div className="animate-on-scroll md:sticky md:top-28 self-start">
              <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-6"><span className="font-mirano">10</span><span className="w-8 h-[2px] bg-[#D8D4BD]/30" aria-hidden="true"></span>Manifesto</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter font-extended leading-[0.95] text-white">
                Propagação não é barulho.<br />É direção.
              </h2>
              <div className="h-divider text-[#D8D4BD]/60 mt-10" aria-hidden="true"><span></span></div>
              <p className="mt-8 text-lg md:text-xl font-black uppercase tracking-widest font-mirano text-white">
                PROH. Propagar valor.
              </p>
            </div>

            {/* Coluna de leitura: blocos curtos, alinhados à esquerda */}
            <div className="max-w-[60ch]">
              <ul className="space-y-4 text-lg md:text-xl font-medium text-[#D8D4BD]/80 animate-on-scroll">
                <li className="flex items-start gap-4"><span className="mt-3.5 w-7 h-[2px] bg-[#D8D4BD]/40 shrink-0" aria-hidden="true"></span>Nem tudo que aparece permanece.</li>
                <li className="flex items-start gap-4"><span className="mt-3.5 w-7 h-[2px] bg-[#D8D4BD]/40 shrink-0" aria-hidden="true"></span>Nem tudo que alcança gera impacto.</li>
                <li className="flex items-start gap-4"><span className="mt-3.5 w-7 h-[2px] bg-[#D8D4BD]/40 shrink-0" aria-hidden="true"></span>Nem toda mensagem se transforma em movimento.</li>
              </ul>

              <p className="mt-10 text-base md:text-lg leading-relaxed text-[#D8D4BD]/70 animate-on-scroll delay-100">
                Para propagar, não basta falar mais alto. É preciso ter:
              </p>
              <p className="mt-4 text-2xl md:text-4xl font-black text-white font-extended uppercase tracking-tight leading-tight animate-on-scroll delay-100">
                Verdade. Forma.<br />Direção. Consistência.
              </p>

              <div className="mt-10 space-y-6 text-base md:text-lg leading-relaxed text-[#D8D4BD]/70 animate-on-scroll delay-200">
                <p>Acreditamos em marcas que constroem, empresas que geram oportunidades, pessoas que lideram e causas que transformam realidades.</p>
                <p>Acreditamos que estratégia e humanidade podem caminhar juntas. Que crescimento pode produzir valor. Que influência pode ser usada com responsabilidade. Que comunicação pode gerar negócios e, ao mesmo tempo, gerar significado.</p>
              </div>

              <p className="mt-10 text-lg md:text-xl font-bold text-white border-l-4 border-[#D8D4BD] pl-5 animate-on-scroll delay-300">
                A <Proh /> existe para fazer o que tem valor alcançar mais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 12 — PERGUNTAS FREQUENTES */}
      <section id="faq" className="stack-card z-[120] w-full py-20 md:py-28 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full">
          <div className="mb-12 md:mb-16 animate-on-scroll">
            <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">11</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Perguntas frequentes</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter font-extended leading-tight">
              O que você precisa saber antes de começar.
            </h2>
          </div>

          <div className="animate-on-scroll delay-100">
            <FaqItem q={<>A <Proh /> é uma agência de branding ou de performance?</>} a={<>A <Proh /> trabalha com as duas dimensões. O branding organiza percepção, posicionamento e identidade. A performance amplia alcance, demanda e conversão. As estratégias são integradas para que o resultado imediato também fortaleça a marca no longo prazo.</>} />
            <FaqItem q="Os serviços podem ser contratados separadamente?" a="Sim. Os serviços podem ser organizados como projetos pontuais, sprints, consultorias ou parcerias recorrentes. A recomendação depende do momento, da estrutura e dos objetivos de cada cliente." />
            <FaqItem q={<>A <Proh /> atende empresas e organizações sociais?</>} a="Sim. A agência trabalha com marcas, negócios, profissionais, instituições e projetos de impacto. O ponto em comum é a existência de valor real e a necessidade de comunicá-lo com mais direção." />
            <FaqItem q={<>A <Proh /> também executa sites, campanhas e mídia paga?</>} a={<>Sim. A <Proh /> integra estratégia, branding, conteúdo, design, experiências digitais, campanhas e mídia. O escopo é definido conforme a necessidade do projeto.</>} />
            <FaqItem q="Como um projeto começa?" a={<>Todo projeto começa por uma conversa de diagnóstico. A <Proh /> busca compreender contexto, objetivos, desafios, público, momento da marca e resultado esperado. A partir disso, é apresentada uma recomendação de escopo e formato de parceria.</>} />
            <FaqItem q={<>A <Proh /> trabalha apenas com projetos de alto padrão?</>} a={<>A <Proh /> trabalha com alto padrão de pensamento, estratégia e execução. Isso não significa atender apenas marcas de luxo. Significa trabalhar com organizações que valorizam qualidade, clareza, consistência e responsabilidade.</>} />
          </div>
        </div>
      </section>

      {/* SEÇÃO 13 — CTA FINAL + FORMULÁRIO */}
      <section id="contato" className="stack-card z-[130] w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="animate-on-scroll lg:sticky lg:top-28">
              <p className="flex items-center gap-3 uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4"><span className="font-mirano">12</span><span className="w-8 h-[2px] bg-[#0F0F15]/30" aria-hidden="true"></span>Contato</p>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter font-extended leading-[0.95] mb-6">
                O que tem valor não deveria permanecer <span className="mark-dark">invisível</span>.
              </h2>
              <p className="text-xl md:text-2xl font-bold mb-4 font-extended">
                Vamos transformar sua comunicação em movimento?
              </p>
              <p className="text-base md:text-lg text-[#0F0F15]/70 max-w-xl">
                Estratégia, marca, conteúdo e mídia trabalhando na mesma direção para
                gerar crescimento, reputação e impacto. Conte brevemente sobre sua
                marca, projeto ou causa — a <Proh /> entrará em contato para compreender
                o momento e indicar o melhor caminho.
              </p>
            </div>

            <div className="animate-on-scroll delay-200">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="relative z-[140] w-full bg-[#0F0F15] text-[#D8D4BD] pt-20 pb-12 rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-[-2.5rem] md:mt-[-3rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-12 md:gap-10 mb-14">
            <div>
              <img src={logoFooter} alt="PROH Media" className="h-10 w-auto mb-6" />
              <p className="text-sm uppercase tracking-widest font-bold font-extended text-[#D8D4BD]/70">
                Estratégia, marca, mídia e impacto.
              </p>
              <p className="text-sm uppercase tracking-widest font-bold font-mirano text-white mt-1">
                Propagar valor.
              </p>
              <div className="h-divider text-[#D8D4BD]/50 mt-8" aria-hidden="true"><span></span></div>
            </div>
            <nav aria-label="Navegação do rodapé">
              <p className="text-xs uppercase tracking-[0.25em] font-bold font-extended text-[#D8D4BD]/40 mb-5">Navegação</p>
              <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-widest font-extended text-[#D8D4BD]/60">
                {navLinks.map((l) => (
                  <a key={l.id} href={`#${l.id}`} className="hover:text-white transition-colors w-fit">{l.label}</a>
                ))}
              </div>
            </nav>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-bold font-extended text-[#D8D4BD]/40 mb-5">Contato</p>
              <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-widest font-extended text-[#D8D4BD]/60">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">WhatsApp</a>
                <a href="#contato" className="hover:text-white transition-colors w-fit">Iniciar projeto</a>
                {SOCIAL.instagram && <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">Instagram</a>}
                {SOCIAL.linkedin && <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">LinkedIn</a>}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#D8D4BD]/20 text-xs font-bold uppercase tracking-widest text-[#D8D4BD]/50 font-extended">
            <p>O que tem valor merece alcance.</p>
            <p>© {new Date().getFullYear()} <Proh /> Media. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- FORMULÁRIO DE CONTATO ---
// Sem backend: monta um e-mail pré-preenchido (mailto) com os dados do projeto.
function ContactForm() {
  const [form, setForm] = useState({
    nome: '', empresa: '', email: '', whatsapp: '', tipo: '', desafio: '', momento: '',
  });
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipo || !form.momento) {
      setFormError('Selecione o tipo e o momento do projeto.');
      return;
    }
    setFormError(null);
    // Monta a mensagem e abre o WhatsApp da PROH com o texto pronto para envio.
    const body = [
      `Olá, PROH! Quero propagar valor. 🚀`,
      '',
      `*Nome:* ${form.nome}`,
      `*Empresa ou projeto:* ${form.empresa || '—'}`,
      `*E-mail:* ${form.email}`,
      `*WhatsApp:* ${form.whatsapp || '—'}`,
      `*Tipo de projeto:* ${form.tipo}`,
      `*Momento:* ${form.momento}`,
      '',
      `*Principal desafio:*`,
      form.desafio,
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    setSent(true);
  };

  const inputClass = "w-full px-6 py-4 rounded-full bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/40 text-[#0F0F15] placeholder:text-[#0F0F15]/40 font-medium";
  const textareaClass = "w-full px-6 py-4 rounded-[1.75rem] bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/40 text-[#0F0F15] placeholder:text-[#0F0F15]/40 font-medium";
  const labelClass = "block text-xs font-bold uppercase tracking-widest font-extended mb-2 text-[#0F0F15]/70";

  return (
    <form onSubmit={handleSubmit} className="bg-white/60 border border-white p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl">
      <h3 className="text-2xl font-black uppercase tracking-tighter font-extended mb-8">Vamos começar</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="f-nome" className={labelClass}>Nome</label>
          <input id="f-nome" type="text" required placeholder="Como podemos chamar você?" className={inputClass} value={form.nome} onChange={update('nome')} />
        </div>
        <div>
          <label htmlFor="f-empresa" className={labelClass}>Empresa ou projeto</label>
          <input id="f-empresa" type="text" placeholder="Nome da empresa, marca ou iniciativa" className={inputClass} value={form.empresa} onChange={update('empresa')} />
        </div>
        <div>
          <label htmlFor="f-email" className={labelClass}>E-mail</label>
          <input id="f-email" type="email" required placeholder="Melhor e-mail para contato" className={inputClass} value={form.email} onChange={update('email')} />
        </div>
        <div>
          <label htmlFor="f-whatsapp" className={labelClass}>WhatsApp</label>
          <input id="f-whatsapp" type="tel" placeholder="Número com DDD" className={inputClass} value={form.whatsapp} onChange={update('whatsapp')} />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="f-tipo" className={labelClass}>Tipo de projeto</label>
        <SelectField
          id="f-tipo"
          placeholder="Selecione uma opção"
          value={form.tipo}
          onChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
          options={['Estratégia', 'Branding', 'Conteúdo', 'Social media', 'Mídia e performance', 'Site ou landing page', 'Comunicação de impacto', 'Projeto completo', 'Ainda não sei']}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="f-desafio" className={labelClass}>Principal desafio</label>
        <textarea id="f-desafio" required rows={4} placeholder="Conte brevemente o que precisa ser resolvido." className={textareaClass} value={form.desafio} onChange={update('desafio')} />
      </div>

      <div className="mb-8">
        <label htmlFor="f-momento" className={labelClass}>Momento do projeto</label>
        <SelectField
          id="f-momento"
          placeholder="Selecione uma opção"
          value={form.momento}
          onChange={(v) => setForm((f) => ({ ...f, momento: v }))}
          options={['Preciso começar imediatamente', 'Dentro dos próximos 30 dias', 'Dentro dos próximos três meses', 'Estou pesquisando possibilidades']}
        />
      </div>

      <button type="submit" className="w-full bg-[#0F0F15] text-[#D8D4BD] px-8 py-5 text-sm font-bold uppercase tracking-widest hover:bg-black transition-all rounded-full font-extended shadow-lg flex items-center justify-center gap-2 group">
        <MessageCircle className="w-4 h-4" />
        Enviar pelo WhatsApp
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="mt-3 text-xs font-medium text-[#0F0F15]/50 text-center">
        Ao enviar, o WhatsApp abre com sua mensagem pronta — é só confirmar.
      </p>

      {formError && (
        <p className="mt-4 text-sm font-bold text-red-600 text-center">{formError}</p>
      )}

      {sent && (
        <p className="mt-4 text-sm font-medium text-[#0F0F15]/80 text-center">
          Abrimos o WhatsApp com sua mensagem pronta — é só apertar enviar.
          Em breve, entraremos em contato para entender como podemos propagar esse valor.
        </p>
      )}
    </form>
  );
}

// --- SIMULADOR COM IA (GEMINI VIA PROXY) ---
function GeminiSimulator() {
  const [businessNiche, setBusinessNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateIdeas = async () => {
    if (!businessNiche.trim()) return;

    if (!geminiProxyUrl) {
      setError("Configure VITE_GEMINI_PROXY_URL (URL do proxy) para ativar o simulador.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const fetchWithBackoff = async (attempt = 0) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      try {
        // Chama o proxy no Cloudflare Worker; a chave da API fica no servidor.
        const response = await fetch(geminiProxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche: businessNiche.trim() })
        });

        if (!response.ok) throw new Error('Falha na comunicação com a IA.');

        const data = await response.json();
        // O proxy retorna { resultado, valor } diretamente.
        if (data && (data.resultado || data.valor)) {
          setResult(data);
        } else {
          throw new Error('Resposta vazia da IA.');
        }
      } catch (err) {
        if (attempt < delays.length) {
          await new Promise(resolve => setTimeout(resolve, delays[attempt]));
          return fetchWithBackoff(attempt + 1);
        }
        setError("Não foi possível gerar a estratégia no momento. Tente novamente mais tarde.");
      }
    };

    await fetchWithBackoff();
    setLoading(false);
  };

  return (
    <div className="glass-panel-light p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl bg-white/60 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 text-[#D8D4BD]/40 z-0 pointer-events-none">
        <Sparkles size={200} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 md:gap-10 items-center">
        <div className="lg:w-1/2 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F0F15] text-[#D8D4BD] rounded-full text-xs font-bold uppercase tracking-widest mb-6 font-extended">
            <Sparkles size={14} className="text-yellow-400" /> IA da <Proh />
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter font-extended text-[#0F0F15] leading-tight">
            Veja as duas dimensões<br />no seu mercado
          </h3>
          <p className="text-[#0F0F15]/70 mb-8 font-medium leading-relaxed max-w-md">
            Digite o segmento da sua empresa e receba, na hora, uma ideia de
            crescimento e uma ideia de impacto — as duas dimensões do valor
            que a <Proh /> propaga.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ex: Clínica de Estética, Marca de Roupas..."
              className="flex-1 min-w-0 px-6 py-4 rounded-full bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/30 text-[#0F0F15] placeholder:text-[#0F0F15]/40 shadow-inner font-medium"
              value={businessNiche}
              onChange={(e) => setBusinessNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
            />
            <button
              onClick={generateIdeas}
              disabled={loading || !businessNiche.trim()}
              className="bg-[#0F0F15] text-[#D8D4BD] px-6 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-black transition-all font-extended disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Gerando...' : 'Gerar Ideias'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-3 font-medium">{error}</p>}
        </div>

        <div className="lg:w-1/2 w-full flex flex-col gap-4">
          {/* Card Crescimento */}
          <div className={`p-6 rounded-2xl transition-all duration-500 border ${result ? 'bg-white/90 border-[#0F0F15]/10 shadow-xl' : 'bg-white/30 border-transparent blur-[2px] opacity-60'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#0F0F15] mb-3 font-extended">
              <TrendingUp size={16} /> 1. Propagar crescimento
            </h4>
            <p className="text-[#0F0F15]/80 font-medium leading-relaxed">
              {loading ? (
                 <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin-slow" /> Analisando mercado...</span>
              ) : result ? (
                result.resultado
              ) : (
                "Sua estratégia de conversão e performance aparecerá aqui após a análise."
              )}
            </p>
          </div>

          {/* Card Impacto */}
          <div className={`p-6 rounded-2xl transition-all duration-500 border ${result ? 'bg-[#0F0F15] border-[#0F0F15] text-[#D8D4BD] shadow-xl' : 'bg-[#0F0F15]/10 border-transparent blur-[2px] opacity-60'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-3 font-extended text-white">
              <HeartHandshake size={16} /> 2. Propagar impacto
            </h4>
            <p className="font-medium leading-relaxed text-[#D8D4BD]/90">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin-slow" /> Conectando propósito...</span>
              ) : result ? (
                result.valor
              ) : (
                "Sua estratégia de impacto humano e legado aparecerá aqui após a análise."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
// Dropdown com o visual do site (substitui o <select> nativo do sistema).
function SelectField({ id, placeholder, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 rounded-full bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/40 text-left font-medium flex items-center justify-between gap-3"
      >
        <span className={value ? 'text-[#0F0F15]' : 'text-[#0F0F15]/40'}>{value || placeholder}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-[#0F0F15]/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 w-full bg-white rounded-[1.5rem] border border-[#0F0F15]/10 shadow-2xl py-2 max-h-72 overflow-auto"
        >
          {options.map((o) => (
            <li key={o} role="option" aria-selected={o === value}>
              <button
                type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-6 py-3 font-medium transition-colors hover:bg-[#D8D4BD]/40 ${o === value ? 'bg-[#D8D4BD]/50 font-bold' : 'text-[#0F0F15]/80'}`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Faixa decorativa com o sistema de mensagens da marca.
const MARQUEE_ITEMS = ['Propagar valor.', 'Propagar marcas.', 'Propagar ideias.', 'Propagar resultados.', 'Propagar conexões.', 'Propagar impacto.', 'Propagar o que importa.'];
function MarqueeTrack() {
  return (
    <div className="marquee-track">
      {MARQUEE_ITEMS.map((t) => (
        <span key={t} className="flex items-center shrink-0">
          <span className="font-mirano text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white whitespace-nowrap">{t}</span>
          <span className="mx-6 md:mx-10 w-1.5 h-1.5 bg-white/50 rounded-full shrink-0"></span>
        </span>
      ))}
    </div>
  );
}
function Marquee() {
  return <div className="marquee"><MarqueeTrack /><MarqueeTrack /></div>;
}

// Nome da marca: sempre em Mirano Extended, herdando cor e peso do contexto.
function Proh() {
  return <span className="font-mirano">PROH</span>;
}

function SolutionCard({ icon, title, desc, items }) {
  return (
    <div className="h-full p-8 bg-white/60 border border-white hover:border-[#0F0F15]/10 transition-all duration-500 group rounded-[2rem] hover:-translate-y-2 shadow-sm hover:shadow-xl">
      <div className="text-[#0F0F15] mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-[#0F0F15] font-extended">{title}</h3>
      <p className="text-[#0F0F15]/70 leading-relaxed font-medium text-sm md:text-base mb-5">
        {desc}
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#0F0F15]/60 font-medium">
            <span className="w-3 h-[2px] bg-[#0F0F15]/30 shrink-0"></span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="h-full p-6 md:p-7 border border-[#D8D4BD]/15 rounded-[1.5rem] hover:border-[#D8D4BD]/40 hover:bg-white/[0.03] transition-all duration-500">
      <div className="flex items-center gap-4 mb-5" aria-hidden="true">
        <span className="text-3xl md:text-4xl font-black text-white/20 font-extended select-none leading-none">{num}</span>
        <span className="h-[2px] flex-1 bg-[#D8D4BD]/15"></span>
      </div>
      <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white font-extended">{title}</h3>
      <p className="text-[#D8D4BD]/70 leading-relaxed font-medium text-sm">
        {desc}
      </p>
    </div>
  );
}

function Differential({ title, desc }) {
  return (
    <div className="border-t-2 border-[#0F0F15] pt-6 h-full">
      <h3 className="text-lg font-bold mb-3 uppercase tracking-wider font-extended">{title}</h3>
      <p className="text-[#0F0F15]/70 leading-relaxed font-medium text-sm md:text-base">{desc}</p>
    </div>
  );
}

function AudienceCard({ icon, title, desc }) {
  return (
    <div className="h-full p-8 bg-white/60 border border-white rounded-[2rem] hover:-translate-y-1 hover:shadow-lg transition-all duration-500 flex items-start gap-5">
      <div className="bg-[#0F0F15] text-[#D8D4BD] w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2 uppercase tracking-wider font-extended">{title}</h3>
        <p className="text-[#0F0F15]/70 leading-relaxed font-medium text-sm md:text-base">{desc}</p>
      </div>
    </div>
  );
}

function ModelCard({ title, desc, items }) {
  return (
    <div className="h-full p-7 bg-white/60 border border-white rounded-[2rem] hover:-translate-y-2 hover:shadow-xl transition-all duration-500 flex flex-col">
      <h3 className="text-lg font-bold mb-3 uppercase tracking-wider font-extended leading-snug">{title}</h3>
      <p className="text-[#0F0F15]/70 leading-relaxed font-medium text-sm mb-5">{desc}</p>
      <ul className="space-y-1.5 mt-auto">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#0F0F15]/60 font-medium">
            <span className="w-3 h-[2px] bg-[#0F0F15]/30 shrink-0"></span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0F0F15]/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-6 text-left group"
      >
        <span className="text-base md:text-lg font-bold font-extended">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} text-[#0F0F15]/50 group-hover:text-[#0F0F15]`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <p className="text-[#0F0F15]/70 leading-relaxed font-medium">{a}</p>
      </div>
    </div>
  );
}
