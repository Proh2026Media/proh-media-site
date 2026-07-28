import React, { useState, useEffect } from 'react';
import {
  ArrowRight, CheckCircle2, Sparkles, Loader2, Menu, X, ChevronDown,
  Compass, Fingerprint, PenLine, TrendingUp, MonitorSmartphone, HeartHandshake,
  Briefcase, UserRound, Landmark, HandHeart,
} from 'lucide-react';

// --- LOGOS OFICIAIS (pasta /SVG) ---
import logoHeader from './SVG/proh-black.svg';
import logoFooter from './SVG/proh-white-off.svg';

// --- CONFIGURAÇÃO ---
// E-mail que recebe os projetos do formulário (ajuste quando tiver o oficial).
const CONTACT_EMAIL = 'contato@prohmedia.com';
// Redes sociais: preencha as URLs para os links aparecerem no rodapé.
const SOCIAL = { instagram: '', linkedin: '' };

// --- CONFIGURAÇÃO DO SIMULADOR DE IA ---
// A chave da API NÃO fica no site. O front chama um proxy (Cloudflare Worker)
// que guarda a chave no servidor. Defina a URL do proxy em VITE_GEMINI_PROXY_URL.
const geminiProxyUrl = (import.meta as any).env?.VITE_GEMINI_PROXY_URL ?? "";

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

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

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

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      animObserver.disconnect();
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
        html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
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
        }
      `}} />

      {/* HEADER */}
      <header
        className={`fixed w-full z-[100] transition-all duration-500 ${
          isScrolled || menuOpen ? 'bg-[#D8D4BD]/95 backdrop-blur-md py-3 md:py-4 shadow-sm' : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo oficial PROH */}
          <div className="cursor-pointer transition-transform hover:scale-105 flex items-center" onClick={() => { closeMenu(); window.scrollTo(0, 0); }}>
            <img src={logoHeader} alt="PROH Media" className="h-7 md:h-10 w-auto drop-shadow-sm" />
          </div>

          <nav className="hidden lg:flex gap-8 text-sm font-bold tracking-wider uppercase text-[#0F0F15] font-extended">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className={`transition-all border-b-2 pb-0.5 ${activeSection === l.id ? 'border-[#0F0F15]' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contato" className="hidden lg:inline-flex whitespace-nowrap bg-[#0F0F15] text-[#D8D4BD] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0F0F15] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-xl font-extended">
              Começar um projeto
            </a>

            {/* Botão do menu mobile */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-[#0F0F15] hover:bg-[#0F0F15]/5 transition-colors"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Menu mobile (dropdown) */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col px-6 pt-2 pb-6">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={closeMenu} className="py-4 text-lg font-bold uppercase tracking-wider text-[#0F0F15] border-b border-[#0F0F15]/10 font-extended">{l.label}</a>
            ))}
            <a href="#contato" onClick={closeMenu} className="mt-5 bg-[#0F0F15] text-[#D8D4BD] px-6 py-4 text-sm font-bold uppercase tracking-widest text-center rounded-xl font-extended">
              Começar um projeto
            </a>
          </nav>
        </div>
      </header>

      {/* CARTAS SOBREPOSTAS: as quatro primeiras seções (a narrativa conceitual)
          usam md:sticky — cada uma gruda no topo e a seguinte desliza por cima.
          Da seção Soluções em diante, o fluxo volta ao normal. */}

      {/* SEÇÃO 1 — HERO */}
      <section id="hero" className="md:sticky md:top-0 z-10 w-full min-h-screen flex flex-col justify-center overflow-hidden relative bg-[#D8D4BD]">
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10 pt-28 pb-20 md:pt-32 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center">
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
              <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#0F0F15] text-[#D8D4BD] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0F0F15] transition-all duration-300 rounded-xl group font-extended w-full sm:w-fit shadow-lg hover:shadow-2xl">
                Quero propagar valor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#metodo" className="inline-flex items-center justify-center gap-2 border-2 border-[#0F0F15] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#0F0F15] hover:text-[#D8D4BD] transition-all duration-300 rounded-xl font-extended w-full sm:w-fit">
                Conhecer nosso método
              </a>
            </div>
            <p className="mt-10 text-xs uppercase tracking-[0.3em] text-[#0F0F15]/50 font-bold font-mirano animate-on-scroll delay-400">
              PROH. Propagar valor.
            </p>
          </div>

          {/* Foto editorial: Avenida Paulista — pessoas reais, movimento, alcance */}
          <div className="animate-on-scroll delay-300">
            <img
              src="https://images.unsplash.com/photo-1578002573559-689b0abc4148?q=80&w=1200&auto=format&fit=crop"
              alt="Avenida Paulista, em São Paulo, com pessoas atravessando a ciclovia entre os prédios"
              loading="eager"
              className="img-brand w-full h-64 sm:h-80 lg:h-[32rem] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 — O CONCEITO */}
      <section id="conceito" className="md:sticky md:top-0 z-20 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 rounded-t-[2.5rem] md:rounded-t-[3rem] bg-[#0F0F15] text-[#D8D4BD] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.4)] relative mt-[-2rem] md:mt-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll">
              <div className="text-6xl md:text-9xl font-black text-white/5 mb-6 leading-none font-mirano select-none" aria-hidden="true">
                PROH
              </div>
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
            {/* Foto conceitual: prédios apontando para cima, avião cruzando o céu — alcançar mais */}
            <img
              src="https://images.unsplash.com/photo-1529063317578-487cc3a86772?q=80&w=1200&auto=format&fit=crop"
              alt="Prédios vistos de baixo com um avião cruzando o céu ao centro"
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
      <section id="significado" className="md:sticky md:top-0 z-30 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="text-center mb-12 md:mb-16 animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter font-extended leading-tight">
              Comunicação a favor do progresso,<br className="hidden md:block" /> com o <span className="mark-dark">humano</span> no centro.
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

          <p className="text-center text-lg md:text-2xl font-bold font-extended animate-on-scroll delay-400">
            <Proh /> transforma valor em percepção, presença, crescimento e impacto.
          </p>
        </div>
      </section>

      {/* SEÇÃO 4 — DUAS DIMENSÕES DO VALOR */}
      <section id="dimensoes" className="md:sticky md:top-0 z-40 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] relative mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="text-center mb-12 md:mb-16 animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter font-extended leading-tight">
              Resultado e humanidade<br className="hidden md:block" /> não precisam caminhar <span className="mark-dark">separados</span>.
            </h2>
            <p className="text-lg md:text-xl text-[#0F0F15]/70 max-w-3xl mx-auto">
              A comunicação pode gerar crescimento sem se tornar fria. Pode falar de
              impacto sem perder estratégia. Pode construir desejo sem abrir mão da
              responsabilidade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Valor de negócio */}
            <div className="bg-[#D8D4BD]/50 border border-[#0F0F15]/5 p-8 sm:p-10 md:p-14 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll delay-100">
              {/* Foto: estratégia em ação — brainstorm na parede de vidro */}
              <img
                src="https://images.unsplash.com/photo-1758691736836-0413b066787a?q=80&w=1000&auto=format&fit=crop"
                alt="Equipe diversa fazendo brainstorm com notas adesivas em uma parede de vidro"
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
              {/* Foto: encontro humano real e descontraído */}
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                alt="Três pessoas rindo juntas durante uma conversa à mesa"
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

          <p className="text-center text-base md:text-xl font-medium text-[#0F0F15]/70 mt-12 animate-on-scroll delay-400">
            O resultado não precisa ser apenas um número. Ele também pode ser relevância.
          </p>
        </div>
      </section>

      {/* SEÇÃO 5 — SOLUÇÕES */}
      <section id="solucoes" className="relative z-50 w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4">Soluções</p>
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
      <section id="metodo" className="relative z-50 w-full py-20 md:py-28 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-12 md:mb-16">
            <div className="animate-on-scroll">
              <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-4">Método</p>
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
            <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#D8D4BD] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 rounded-xl group font-extended shadow-lg">
              Aplicar o Sistema <Proh />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — DIFERENCIAIS */}
      <section id="diferenciais" className="relative z-50 w-full py-20 md:py-28 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4">Diferenciais</p>
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
      <section id="publicos" className="relative z-50 w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4">Para quem</p>
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
      <section id="impacto" className="relative z-50 w-full py-20 md:py-28 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="animate-on-scroll">
              <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-4">Impacto</p>
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
              <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#D8D4BD] text-[#0F0F15] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 rounded-xl group font-extended shadow-lg">
                Propagar uma causa
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <div className="flex flex-col gap-6 animate-on-scroll delay-200">
              {/* Foto: voluntariado com dignidade e participação */}
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop"
                alt="Voluntária organizando caixas de doações com um sorriso"
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
      <section id="modelos" className="relative z-50 w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-3xl mb-12 md:mb-16 animate-on-scroll">
            <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4">Modelos de parceria</p>
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
            <a href="#contato" className="inline-flex items-center justify-center gap-2 bg-[#0F0F15] text-[#D8D4BD] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#0F0F15] transition-all duration-300 rounded-xl group font-extended shadow-lg">
              Encontrar o modelo ideal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 11 — MANIFESTO */}
      <section id="manifesto" className="relative z-50 w-full py-24 md:py-32 bg-[#0F0F15] text-[#D8D4BD] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.4)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full text-center">
          <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#D8D4BD]/60 mb-8 animate-on-scroll">Manifesto</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter font-extended leading-[0.95] mb-12 text-white animate-on-scroll delay-100">
            Propagação não é barulho.<br />É direção.
          </h2>
          <div className="space-y-6 text-lg md:text-2xl font-medium leading-relaxed text-[#D8D4BD]/80 animate-on-scroll delay-200">
            <p>Nem tudo que aparece permanece.<br />Nem tudo que alcança gera impacto.<br />Nem toda mensagem se transforma em movimento.</p>
            <p>Para propagar, não basta falar mais alto.<br />É preciso ter <strong className="text-white">verdade. Forma. Direção. Consistência.</strong></p>
            <p>Acreditamos em marcas que constroem, empresas que geram oportunidades, pessoas que lideram e causas que transformam realidades.</p>
            <p>Acreditamos que estratégia e humanidade podem caminhar juntas. Que crescimento pode produzir valor. Que influência pode ser usada com responsabilidade. Que comunicação pode gerar negócios e, ao mesmo tempo, gerar significado.</p>
            <p className="text-white font-bold">A <Proh /> existe para fazer o que tem valor alcançar mais.</p>
          </div>
          <div className="h-divider justify-center text-[#D8D4BD] mt-12 animate-on-scroll delay-300" aria-hidden="true"><span></span></div>
          <p className="mt-8 text-xl md:text-2xl font-black uppercase tracking-widest font-mirano text-white animate-on-scroll delay-300">
            PROH. Propagar valor.
          </p>
        </div>
      </section>

      {/* SEÇÃO 12 — PERGUNTAS FREQUENTES */}
      <section id="faq" className="relative z-50 w-full py-20 md:py-28 bg-white text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full">
          <div className="mb-12 md:mb-16 animate-on-scroll">
            <p className="uppercase text-sm font-bold tracking-widest font-extended text-[#0F0F15]/60 mb-4">Perguntas frequentes</p>
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
      <section id="contato" className="relative z-50 w-full py-20 md:py-28 bg-[#D8D4BD] text-[#0F0F15] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] mt-[-2rem] md:mt-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="animate-on-scroll lg:sticky lg:top-28">
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
      <footer className="relative z-50 w-full bg-[#0F0F15] text-[#D8D4BD] pt-20 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-14">
            <div>
              <img src={logoFooter} alt="PROH Media" className="h-10 w-auto mb-6" />
              <p className="text-sm uppercase tracking-widest font-bold font-extended text-[#D8D4BD]/70">
                Estratégia, marca, mídia e impacto.
              </p>
              <p className="text-sm uppercase tracking-widest font-bold font-mirano text-white mt-1">
                Propagar valor.
              </p>
            </div>
            <nav className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-sm font-bold uppercase tracking-widest font-extended text-[#D8D4BD]/60">
              <div className="flex flex-col gap-3">
                {navLinks.map((l) => (
                  <a key={l.id} href={`#${l.id}`} className="hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
              {(SOCIAL.instagram || SOCIAL.linkedin) && (
                <div className="flex flex-col gap-3">
                  {SOCIAL.instagram && <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>}
                  {SOCIAL.linkedin && <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>}
                </div>
              )}
            </nav>
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

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = [
      `Nome: ${form.nome}`,
      `Empresa ou projeto: ${form.empresa}`,
      `E-mail: ${form.email}`,
      `WhatsApp: ${form.whatsapp}`,
      `Tipo de projeto: ${form.tipo}`,
      `Momento: ${form.momento}`,
      '',
      'Principal desafio:',
      form.desafio,
    ].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Novo projeto — ${form.empresa || form.nome}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const inputClass = "w-full px-5 py-4 rounded-xl bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/40 text-[#0F0F15] placeholder:text-[#0F0F15]/40 font-medium";
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
        <select id="f-tipo" required className={inputClass} value={form.tipo} onChange={update('tipo')}>
          <option value="" disabled>Selecione uma opção</option>
          {['Estratégia', 'Branding', 'Conteúdo', 'Social media', 'Mídia e performance', 'Site ou landing page', 'Comunicação de impacto', 'Projeto completo', 'Ainda não sei'].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="f-desafio" className={labelClass}>Principal desafio</label>
        <textarea id="f-desafio" required rows={4} placeholder="Conte brevemente o que precisa ser resolvido." className={inputClass} value={form.desafio} onChange={update('desafio')} />
      </div>

      <div className="mb-8">
        <label htmlFor="f-momento" className={labelClass}>Momento do projeto</label>
        <select id="f-momento" required className={inputClass} value={form.momento} onChange={update('momento')}>
          <option value="" disabled>Selecione uma opção</option>
          {['Preciso começar imediatamente', 'Dentro dos próximos 30 dias', 'Dentro dos próximos três meses', 'Estou pesquisando possibilidades'].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="w-full bg-[#0F0F15] text-[#D8D4BD] px-8 py-5 text-sm font-bold uppercase tracking-widest hover:bg-black transition-all rounded-xl font-extended shadow-lg flex items-center justify-center gap-2 group">
        Enviar projeto
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {sent && (
        <p className="mt-5 text-sm font-medium text-[#0F0F15]/80 text-center">
          Seu e-mail foi preparado no seu aplicativo — basta confirmar o envio.
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
            crescimento e uma ideia de impacto — as duas dimensões do valor que a
            <Proh /> propaga.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ex: Clínica de Estética, Marca de Roupas..."
              className="flex-1 min-w-0 px-6 py-4 rounded-xl bg-white/80 border border-[#0F0F15]/10 focus:outline-none focus:border-[#0F0F15]/30 text-[#0F0F15] placeholder:text-[#0F0F15]/40 shadow-inner font-medium"
              value={businessNiche}
              onChange={(e) => setBusinessNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
            />
            <button
              onClick={generateIdeas}
              disabled={loading || !businessNiche.trim()}
              className="bg-[#0F0F15] text-[#D8D4BD] px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-black transition-all font-extended disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
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
      <div className="text-4xl md:text-5xl font-black text-white/10 font-extended mb-4 select-none" aria-hidden="true">{num}</div>
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
