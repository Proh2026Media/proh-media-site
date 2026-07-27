import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Megaphone, Users, Globe, ArrowRight, CheckCircle2, Sparkles, Loader2, Menu, X } from 'lucide-react';

// --- CONFIGURAÇÃO DA API GEMINI ---
// Defina VITE_GEMINI_API_KEY no arquivo .env.local para ativar o simulador de IA.
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? "";

// --- CORES E FONTES DA MARCA ---
// Paleta:
// Escuro: #111111
// Bege: #DCD7C9
// Branco: #FFFFFF
// Família de Fontes: Mirano (Base) e Extended (Destaques)

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
    const sections = ['hero', 'conceito', 'proposito', 'pilares', 'contato'];
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

  return (
    <div className="text-[#111111] bg-[#DCD7C9] selection:bg-[#111111] selection:text-[#DCD7C9] overflow-x-hidden" style={{ fontFamily: "'Mirano', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
        * { -webkit-tap-highlight-color: transparent; }
        body { overflow-x: hidden; }
        .font-extended { font-family: 'Extended', sans-serif; }

        /* Destaque legível para palavras-chave sobre fundos claros */
        .mark-dark {
          background: #111111;
          color: #DCD7C9;
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
          background: rgba(17, 17, 17, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(220, 215, 201, 0.15);
        }
        .glass-panel-light {
          background: rgba(220, 215, 201, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(17, 17, 17, 0.05);
        }

        /* Efeito Parallax Background.
           background-attachment: fixed trava/pisca em navegadores mobile (iOS Safari),
           então só o ativamos em telas largas com ponteiro fino (desktop). */
        .bg-parallax {
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }
        @media (min-width: 768px) and (hover: hover) and (pointer: fine) {
          .bg-parallax { background-attachment: fixed; }
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
        }
      `}} />

      {/* HEADER */}
      <header
        className={`fixed w-full z-[100] transition-all duration-500 ${
          isScrolled || menuOpen ? 'bg-[#DCD7C9]/95 backdrop-blur-md py-3 md:py-4 shadow-sm' : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo PROH - Recriado em SVG Inline para garantir carregamento perfeito e o recorte (cutout) transparente */}
          <div className="cursor-pointer transition-transform hover:scale-105 flex items-center" onClick={() => { closeMenu(); window.scrollTo(0, 0); }}>
            <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-12 w-auto drop-shadow-sm">
              <defs>
                <mask id="logo-cutout">
                  {/* Fundo branco (tudo o que for branco na máscara fica visível) */}
                  <rect width="100%" height="100%" fill="white" />
                  {/* A silhueta do P com uma borda extra grossa em preto para "recortar" o H com transparência real */}
                  <path d="M10 10 h35 c15 0 25 8 25 20 c0 12 -10 20 -25 20 h-15 v10 h-20 z" fill="black" stroke="black" strokeWidth="6" strokeLinejoin="round" />
                </mask>
              </defs>

              {/* Letra H (Branca) - Com a máscara de recorte aplicada */}
              <path d="M55 10 h18 v14 h18 v-14 h18 v40 h-18 v-13 h-18 v13 h-18 z" fill="#FFFFFF" mask="url(#logo-cutout)" />

              {/* Letra P (Preta) */}
              <path d="M10 10 h35 c15 0 25 8 25 20 c0 12 -10 20 -25 20 h-15 v10 h-20 z M30 24 v12 h15 c5 0 8 -2.5 8 -6 c0 -3.5 -3 -6 -8 -6 z" fill="#111111" />
            </svg>
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-wider uppercase text-[#111111] font-extended">
            <a href="#conceito" className={`transition-colors ${activeSection === 'conceito' ? 'text-white drop-shadow-md' : 'hover:text-white'}`}>Conceito</a>
            <a href="#proposito" className={`transition-colors ${activeSection === 'proposito' ? 'text-white drop-shadow-md' : 'hover:text-white'}`}>A Marca</a>
            <a href="#pilares" className={`transition-colors ${activeSection === 'pilares' ? 'text-white drop-shadow-md' : 'hover:text-white'}`}>Atuação</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contato" className="hidden md:inline-flex bg-[#111111] text-[#DCD7C9] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#111111] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-xl font-extended">
              Fale Conosco
            </a>

            {/* Botão do menu mobile */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-[#111111] hover:bg-[#111111]/5 transition-colors"
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Menu mobile (dropdown) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col px-6 pt-2 pb-6">
            <a href="#conceito" onClick={closeMenu} className="py-4 text-lg font-bold uppercase tracking-wider text-[#111111] border-b border-[#111111]/10 font-extended">Conceito</a>
            <a href="#proposito" onClick={closeMenu} className="py-4 text-lg font-bold uppercase tracking-wider text-[#111111] border-b border-[#111111]/10 font-extended">A Marca</a>
            <a href="#pilares" onClick={closeMenu} className="py-4 text-lg font-bold uppercase tracking-wider text-[#111111] border-b border-[#111111]/10 font-extended">Atuação</a>
            <a href="#contato" onClick={closeMenu} className="mt-5 bg-[#111111] text-[#DCD7C9] px-6 py-4 text-sm font-bold uppercase tracking-widest text-center rounded-xl font-extended">
              Fale Conosco
            </a>
          </nav>
        </div>
      </header>

      {/* A MÁGICA DAS CARTAS SOBREPOSTAS:
        Usamos "md:sticky md:top-0" em cada section.
        Conforme a tela desce, a seção gruda no topo e a próxima desliza por cima dela.
      */}

      {/* HERO SECTION - Card 1 */}
      <section id="hero" className="md:sticky md:top-0 z-10 w-full min-h-screen flex flex-col justify-center overflow-hidden relative">
        {/* Parallax Fotográfico */}
        <div className="absolute inset-0 z-0 bg-parallax" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-[#DCD7C9]/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#DCD7C9]/30 to-[#DCD7C9]"></div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10 pt-28 pb-20 md:pt-32">
          <div className="max-w-4xl glass-panel-light p-6 sm:p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll">
            <h2 className="text-[#111111] font-bold uppercase tracking-widest text-xs sm:text-sm md:text-base mb-6 border-l-4 border-[#111111] pl-4 font-extended animate-on-scroll delay-100">
              PROH. proPAGA valor.
            </h2>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] mb-8 text-[#111111] font-extended animate-on-scroll delay-200">
              Propagação <br />
              <span className="text-[#111111] underline decoration-white decoration-[6px] underline-offset-4">não é barulho.</span><br />
              É direção.
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-[#111111]/80 max-w-2xl mb-10 font-medium leading-relaxed animate-on-scroll delay-300">
              Fazer comunicação virar crescimento — e crescimento virar valor.
              Transformamos mensagens em movimento, presença em influência e influência em impacto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-on-scroll delay-400">
              <a href="#pilares" className="inline-flex items-center justify-center gap-2 bg-[#111111] text-[#DCD7C9] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-[#111111] transition-all duration-300 rounded-xl group font-extended w-full sm:w-fit shadow-lg hover:shadow-2xl">
                Conheça nossos pilares
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO / CONCEITO - Card 2 */}
      <section id="conceito" className="md:sticky md:top-0 z-20 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 rounded-t-[2.5rem] md:rounded-t-[3rem] bg-[#111111] text-[#DCD7C9] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.4)] relative mt-[-2rem] md:mt-0 transition-transform duration-500">
        {/* Parallax Fundo Liquid Dark */}
        <div className="absolute inset-0 z-0 opacity-40 bg-parallax mix-blend-luminosity" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          <div className="animate-on-scroll">
            <div className="text-6xl md:text-9xl font-black text-white/5 mb-6 leading-none font-extended">
              PROH
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight font-extended">
              A agência de mídia que existe para <span className="text-white">proPAGAR</span> valor.
            </h2>
            <p className="text-base md:text-lg text-[#DCD7C9]/70 mb-6">
              A marca nasce com uma visão simples: toda boa comunicação gera efeito. Efeito no mercado. Efeito nas pessoas. Efeito no mundo ao redor.
            </p>
            <p className="text-base md:text-lg text-[#DCD7C9]/70">
              Não tentamos "soletrar" propagar — nós marcamos.
              <br /><br />
              <strong className="text-white">PRO</strong> = a favor do que é certo, do que avança (progresso, propósito).<br />
              <strong className="text-white">H</strong> = humano e hub: gente no centro e conexões que ampliam alcance.
            </p>
          </div>
          <div className="glass-panel p-8 sm:p-10 md:p-14 border-l-4 border-[#DCD7C9] rounded-[2rem] md:rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] animate-on-scroll delay-200">
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-6 font-extended">A Promessa</h3>
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              "Fazer comunicação virar crescimento — e crescimento virar valor. Para empresas, clientes, redes e pessoas."
            </p>
          </div>
        </div>
      </section>

      {/* DUAS DIMENSÕES - Card 3 */}
      <section id="proposito" className="md:sticky md:top-0 z-30 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-[#DCD7C9] text-[#111111] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative mt-[-2rem] md:mt-0 overflow-hidden">
        {/* Parallax Fundo Liquid Beige */}
        <div className="absolute inset-0 z-0 opacity-40 bg-parallax" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop)' }}>
          <div className="absolute inset-0 bg-[#DCD7C9]/60 backdrop-blur-[2px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-12 md:mb-16 animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter font-extended leading-tight">As duas dimensões do <span className="mark-dark">proPAGAR</span></h2>
            <p className="text-lg md:text-xl text-[#111111]/70 max-w-2xl mx-auto">A união perfeita entre performance de negócio e propósito humano.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Business */}
            <div className="glass-panel-light p-8 sm:p-10 md:p-14 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] md:rounded-[2.5rem] animate-on-scroll delay-100">
              <div className="bg-[#111111] text-[#DCD7C9] w-16 h-16 flex items-center justify-center rounded-2xl mb-8 shadow-xl">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider font-extended">proPAGAR resultados</h3>
              <p className="text-[#111111]/60 uppercase text-sm font-bold mb-6 tracking-widest font-extended">(O Negócio)</p>
              <p className="text-base md:text-lg mb-8 leading-relaxed">
                Direcionar a marca e amplificar o que ela entrega. Mais alcance, mais conversão, mais consistência.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#111111] shrink-0" />
                  <span>Clareza de posicionamento e mensagem</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#111111] shrink-0" />
                  <span>Conteúdo e mídia que geram demanda</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#111111] shrink-0" />
                  <span>Campanhas e funis com performance</span>
                </li>
              </ul>
            </div>

            {/* Humano */}
            <div className="glass-panel-dark text-[#DCD7C9] p-8 sm:p-10 md:p-14 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl animate-on-scroll delay-300">
              <div className="bg-[#DCD7C9] text-[#111111] w-16 h-16 flex items-center justify-center rounded-2xl mb-8 shadow-xl">
                <HeartIcon />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider font-extended">proPAGAR valor</h3>
              <p className="text-[#DCD7C9]/60 uppercase text-sm font-bold mb-6 tracking-widest font-extended">(O Impacto Humano)</p>
              <p className="text-base md:text-lg mb-8 leading-relaxed text-[#DCD7C9]/90">
                Impactar pessoas com respeito e verdade. Construindo reputação, confiança, legado e mobilização real.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#DCD7C9] shrink-0" />
                  <span>Comunicação com respeito e sem manipulação</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#DCD7C9] shrink-0" />
                  <span>Projetos e causas traduzidas em narrativa forte</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#DCD7C9] shrink-0" />
                  <span>Responsabilidade social com credibilidade</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES DE ATUAÇÃO - Card 4 */}
      <section id="pilares" className="md:sticky md:top-0 z-40 w-full md:min-h-screen flex flex-col md:justify-center py-20 md:py-24 bg-[#E5E1D5] rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] relative mt-[-2rem] md:mt-0 overflow-hidden">
        {/* Fundo leve para diferenciar do card anterior */}
        <div className="absolute inset-0 z-0 opacity-[0.08] bg-parallax mix-blend-multiply" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop)' }}></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-12 md:mb-16 uppercase tracking-tighter text-center font-extended animate-on-scroll">
            Pilares de <span className="mark-dark">Atuação</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="animate-on-scroll delay-100"><PillarCard icon={<Target size={24} strokeWidth={1.5} />} title="Direção de Marca" desc="Posicionamento, narrativa, mensagem, tom e identidade visual de comunicação." /></div>
            <div className="animate-on-scroll delay-200"><PillarCard icon={<TrendingUp size={24} strokeWidth={1.5} />} title="Mídia e Performance" desc="Campanhas, tráfego pago, funis de vendas, análise de dados e otimização contínua." /></div>
            <div className="animate-on-scroll delay-300"><PillarCard icon={<Megaphone size={24} strokeWidth={1.5} />} title="Conteúdo que Propaga" desc="Roteiros, séries, criativos, social media premium, storytelling e distribuição." /></div>
            <div className="animate-on-scroll delay-100"><PillarCard icon={<Users size={24} strokeWidth={1.5} />} title="Reputação e Comunidade" desc="Networking estratégico, parcerias, marca empregadora e presença institucional." /></div>
            <div className="animate-on-scroll delay-200"><PillarCard icon={<Globe size={24} strokeWidth={1.5} />} title="Impacto e Causa" desc="Campanhas sociais, captação, sensibilização e relatórios de impacto social." /></div>

            {/* Card de Chamada */}
            <div className="animate-on-scroll delay-300 h-full">
              <div className="bg-[#61605A] h-full min-h-[220px] p-8 flex flex-col justify-center items-center text-center text-[#DCD7C9] group cursor-pointer hover:bg-[#4E4D48] transition-colors rounded-[2rem] shadow-sm border-none">
                <h3 className="text-2xl font-bold mb-6 uppercase font-extended text-white tracking-wider leading-snug">Pronto para<br/>propagar?</h3>
                <a href="#contato" className="flex items-center gap-2 text-[#DCD7C9] font-bold uppercase tracking-widest text-xs border-b border-[#DCD7C9]/50 pb-1 group-hover:gap-4 transition-all font-extended">
                  Iniciar Projeto <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* SIMULADOR GEMINI API AI */}
          <div className="animate-on-scroll delay-400 mt-6">
            <GeminiSimulator />
          </div>
        </div>
      </section>

      {/* FOOTER / CTA - Ultimo Card */}
      <footer id="contato" className="relative z-50 w-full bg-[#111111] text-[#DCD7C9] pt-24 md:pt-32 pb-12 rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] mt-[-2rem] md:mt-0 overflow-hidden">
        {/* Fundo do footer parallax */}
        <div className="absolute inset-0 z-0 opacity-10 bg-parallax grayscale" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop)' }}></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-10">

          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-8 text-white font-extended animate-on-scroll leading-[0.95]">
            PROH.<br /> proPAGA valor.
          </h2>

          <p className="text-lg md:text-2xl font-medium max-w-3xl mb-12 text-[#DCD7C9]/80 animate-on-scroll delay-100">
            Somos uma agência de mídia e marketing que existe para proPAGAR o que importa — com forma, estratégia e impacto.
          </p>

          <a href="mailto:contato@prohmedia.com" className="inline-block bg-[#DCD7C9] text-[#111111] px-8 sm:px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-white hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 mb-20 md:mb-24 rounded-2xl font-extended animate-on-scroll delay-200">
            Falar com um Estrategista
          </a>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#DCD7C9]/20 text-sm font-bold uppercase tracking-widest text-[#DCD7C9]/50 font-extended animate-on-scroll delay-300">
            <div className="flex items-center gap-2">
              <span className="text-[#DCD7C9]">P</span>
              <span className="text-white">H</span>
              <span className="ml-1 text-[10px]">MEDIA</span>
            </div>
            <p>© {new Date().getFullYear()} PROH Media. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- INTEGRAÇÃO GEMINI API ---
function GeminiSimulator() {
  const [businessNiche, setBusinessNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateIdeas = async () => {
    if (!businessNiche.trim()) return;

    if (!apiKey) {
      setError("Configure VITE_GEMINI_API_KEY no arquivo .env.local para ativar o simulador.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `
      Você é um estrategista de marca sênior da agência PROH.
      A filosofia da PROH baseia-se em duas dimensões:
      1) "proPAGAR resultados" (performance, vendas, crescimento).
      2) "proPAGAR valor" (propósito, impacto humano, causas sociais).

      O usuário possui um negócio no seguinte segmento: "${businessNiche}".

      Gere 2 ideias curtas e criativas para esta empresa, uma para cada dimensão da PROH.
      Formate a resposta estritamente como um objeto JSON válido com as seguintes propriedades:
      {
        "resultado": "Uma ideia de campanha focada em performance/vendas em até 25 palavras.",
        "valor": "Uma ideia de ação focada em impacto social/comunidade em até 25 palavras."
      }
      Não inclua marcação markdown no JSON, apenas o objeto.
    `;

    const fetchWithBackoff = async (attempt = 0) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error('Falha na comunicação com a IA.');

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
          setResult(JSON.parse(textResponse));
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
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 text-[#DCD7C9]/40 z-0 pointer-events-none">
        <Sparkles size={200} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 md:gap-10 items-center">
        <div className="lg:w-1/2 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#DCD7C9] rounded-full text-xs font-bold uppercase tracking-widest mb-6 font-extended">
            <Sparkles size={14} className="text-yellow-400" /> IA da PROH
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter font-extended text-[#111111] leading-tight">
            Simulador de <br/>Propósito & Performance
          </h3>
          <p className="text-[#111111]/70 mb-8 font-medium leading-relaxed max-w-md">
            Descubra como a metodologia PROH se aplica ao seu mercado. Digite o segmento da sua empresa e receba insights estratégicos na hora.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ex: Clínica de Estética, Marca de Roupas..."
              className="flex-1 min-w-0 px-6 py-4 rounded-xl bg-white/80 border border-[#111111]/10 focus:outline-none focus:border-[#111111]/30 text-[#111111] placeholder:text-[#111111]/40 shadow-inner font-medium"
              value={businessNiche}
              onChange={(e) => setBusinessNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
            />
            <button
              onClick={generateIdeas}
              disabled={loading || !businessNiche.trim()}
              className="bg-[#111111] text-[#DCD7C9] px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-black transition-all font-extended disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Gerando...' : 'Gerar Ideias ✨'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
        </div>

        <div className="lg:w-1/2 w-full flex flex-col gap-4">
          {/* Card Resultados */}
          <div className={`p-6 rounded-2xl transition-all duration-500 border ${result ? 'bg-white/90 border-[#111111]/10 shadow-xl' : 'bg-white/30 border-transparent blur-[2px] opacity-60'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#111111] mb-3 font-extended">
              <TrendingUp size={16} /> 1. proPAGAR Resultados
            </h4>
            <p className="text-[#111111]/80 font-medium leading-relaxed">
              {loading ? (
                 <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin-slow" /> Analisando mercado...</span>
              ) : result ? (
                result.resultado
              ) : (
                "Sua estratégia de conversão e performance aparecerá aqui após a análise."
              )}
            </p>
          </div>

          {/* Card Valor */}
          <div className={`p-6 rounded-2xl transition-all duration-500 border ${result ? 'bg-[#111111] border-[#111111] text-[#DCD7C9] shadow-xl' : 'bg-[#111111]/10 border-transparent blur-[2px] opacity-60'}`}>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-3 font-extended text-white">
              <HeartIcon /> 2. proPAGAR Valor
            </h4>
            <p className="font-medium leading-relaxed text-[#DCD7C9]/90">
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

// Componentes Auxiliares
function PillarCard({ icon, title, desc }) {
  return (
    <div className="h-full p-8 border border-black/5 hover:border-black/10 transition-all duration-500 group rounded-[2rem] hover:-translate-y-2 shadow-sm hover:shadow-xl bg-[#DCD8CA]">
      <div className="text-[#111111] mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-[#111111] font-extended">{title}</h3>
      <p className="text-[#111111]/70 leading-relaxed font-medium text-sm md:text-base">
        {desc}
      </p>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
