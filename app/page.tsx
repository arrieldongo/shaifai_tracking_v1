import { FaWhatsapp, FaLinkedin, FaWhatsappSquare, FaLink, FaMapMarkedAlt, FaPaintBrush } from "react-icons/fa"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white overflow-x-hidden">
      {/* Full-page subtle background tints */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle at 30% 30%, #A7F3D0, #34D399)' }} />
        <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle at 70% 70%, #A7F3D0, #34D399)' }} />
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-4xl font-extrabold tracking-tighter text-[#111827]">shaifai</div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#111827]">
          <a href="/" className="hover:opacity-80">Accueil</a>
          {/* Smooth scroll to services without hash */}
          <SmoothScrollLink targetId="services" className="hover:opacity-80">Nos services</SmoothScrollLink>
          <a href="https://wa.me/2250799239383?text=%C2%AB%20Ajouter%20mon%20service%20sur%20shaifai%20%C2%BB" target="_blank" rel="noreferrer" className="hover:opacity-80">Ajouter son service</a>
          <a href="https://wa.me/2250799239383" target="_blank" rel="noreferrer" className="hover:opacity-80">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          {/* Mobile dropdown menu */}
          <details className="md:hidden relative">
            <summary className="list-none inline-flex items-center rounded-full border border-[#111827] text-[#111827] px-4 py-2 text-sm font-semibold cursor-pointer">Menu</summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-2 text-sm">
              <a href="/" className="block px-3 py-2 rounded hover:bg-gray-50">Accueil</a>
              <SmoothScrollLink targetId="services" className="block px-3 py-2 rounded hover:bg-gray-50">Nos services</SmoothScrollLink>
              <a href="https://wa.me/2250799239383?text=%C2%AB%20Ajouter%20mon%20service%20sur%20shaifai%20%C2%BB" target="_blank" rel="noreferrer" className="block px-3 py-2 rounded hover:bg-gray-50">Ajouter son service</a>
              <a href="https://wa.me/2250799239383" target="_blank" rel="noreferrer" className="block px-3 py-2 rounded hover:bg-gray-50">Contact</a>
            </div>
          </details>
          {/* Desktop CTA */}
          <div
            className="hidden md:inline-flex items-center rounded-full bg-[#10B981] text-white text-sm font-semibold px-4 py-2 hover:brightness-95"
          >
            en test
          </div>
        </div>
      </header>

      {/* Hero #1 (full viewport height) */}
      <section className="relative max-w-7xl mx-auto px-6 pt-4 pb-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[calc(100vh-72px)]">
        {/* subtle white tint gradient for hero #1 */}
        <div
          aria-hidden
          className=" pointer-events-none absolute inset-0 rounded-3xl opacity-60"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(236,253,245,0.55))' }}
        />
        {/* Left (text) */}
        <div className="z-[1]">
          <div className="text-3xl md:text-5xl font-black leading-tight text-[#111827] whitespace-nowrap">
            <span className="text-4xl md:text-7xl text-[#0c9366] tracking-tighter">Hub</span> de services pour des
            <br />
            <span
              className="text-5xl md:text-7xl bg-clip-text text-transparent tracking-tighter whitespace-nowrap"
              style={{ backgroundImage: 'linear-gradient(90deg, #0c9366, #111827)' }}
            >
              Solutions de niche.
            </span>


          </div>
          <p className="mt-4 w-auto text-md/5 text-gray-500 text- md:text-lg/5.5 max-w-lg">
            Nos saas et boutiques s’adressent aujourd'hui aux polytech, aux acteurs du secteur informel et aux entreprises,
            pour leur donner un accès immédiat à des solutions exploitables et efficaces.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <SmoothScrollLink targetId="services" className="inline-flex items-center rounded-full border border-[#111827] text-[#111827] px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">Découvrir</SmoothScrollLink>
            <a href="https://wa.me/2250799239383?text=Demander%20une%20d%C3%A9mo%20shaifai" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#0c9366] text-white px-6 py-3 text-sm md:text-base font-semibold hover:brightness-95">
              Ajouter mon service
            </a>
          </div>
        </div>

        {/* Right (hero image) */}
        <div className="flex items-center justify-center relative z-[2]">
          {/* Provide your image at public/hero/shaifai-hero.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/shaifai-hero.png"
            alt="Illustration livraison et tracking"
            className="max-w-full h-auto object-contain drop-shadow-xl"
            style={{ width: '100%', maxWidth: '560px' }}
          />
        </div>


      </section>

      {/* Hero #2 — services list (full viewport height) */}
      <section className="relative max-w-7xl mx-auto px-6 pb-16 min-h-screen flex items-center" id="services">
        {/* subtle white tint gradient for hero #2 
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-70"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(167,243,208,0.35))' }}
        />
        */}
        <div className="relative z-[1] grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Tracking */}
          <a
            href="/tracking"
            className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] text-2xl">
                <FaMapMarkedAlt />
              </span>
              <div>
                <div className="text-2xl font-semibold text-[#111827]">Tracking</div>
                <div className="text-base text-slate-600">Suivi en temps réel</div>
              </div>
            </div>
          </a>

          {/* Crréa */}
          <a
            href="/crrea"
            className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] text-2xl">
                <FaPaintBrush />
              </span>
              <div>
                <div className="text-2xl font-semibold text-[#111827]">Crréa</div>
                <div className="text-base text-slate-600">Affiches et créations</div>
              </div>
            </div>
          </a>

          {/* Intégrer sa solution */}
          <a
            href="https://wa.me/2250799239383?text=Int%C3%A9grer%20ma%20solution%20sur%20shaifai"
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] text-2xl">
                <FaLink />
              </span>
              <div>
                <div className="text-2xl font-semibold text-[#111827]">Intégrer sa solution</div>
                <div className="text-base text-slate-600">Proposer un service</div>
              </div>
            </div>
          </a>
        </div>
      </section>


      {/* Footer */}
      {/* Footer – style Dribbble */}
      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 text-center">
          {/* Logo scripty (tu peux remplacer par une image) */}
          <div className="text-4xl font-extrabold tracking-tighter text-[#0F172A] select-none">
            shaifai
          </div>

          {/* Ligne 1 – gros liens */}
          <nav className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px] text-[#0F172A]">
            <a className="hover:opacity-70" href="#services">Inspiration</a>
            <a className="hover:opacity-70" href="#services">Publicité</a>
            <a className="hover:opacity-70" href="/blog">Blog</a>
            <a className="hover:opacity-70" href="/about">À propos</a>
            <a className="hover:opacity-70" href="/support">Support</a>
          </nav>

          {/* Réseaux sociaux */}
          <div className="mt-6 flex items-center justify-center gap-6 text-2xl text-[#0F172A]">
            {/* WhatsApp */}
            <a
              href="https://wa.me/2250799239383"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FaWhatsappSquare className=" hover:text-green-700 transition-colors" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/arriel-dongo-73958a250"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FaLinkedin className=" hover:text-blue-800 transition-colors" />
            </a>
          </div>

        </div>

        {/* Ligne 2 – petits liens légaux */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[#475569]">
          <span>© {new Date().getFullYear()} shaifai</span>
          <a className="hover:text-[#0F172A]" href="/terms">Conditions</a>
          <a className="hover:text-[#0F172A]" href="/privacy">Confidentialité</a>
          <a className="hover:text-[#0F172A]" href="/resources">Ressources</a>
        </div>
      </footer>

    </main >
  );
}
import SmoothScrollLink from "@/components/SmoothScrollLink";
