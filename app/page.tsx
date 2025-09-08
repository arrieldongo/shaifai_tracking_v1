export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <header className="mb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">shaifai</h1>
        <p className="text-slate-600 mt-2 text-lg">Vitrine des services</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a href="/crrea" className="rounded-2xl border p-6 hover:shadow-lg transition bg-white">
          <div className="text-2xl font-bold">crréa</div>
          <div className="text-slate-600 mt-1">Affiches par des graphistes pro — style Pinterest</div>
          <div className="mt-4 inline-block text-sm px-3 py-1.5 rounded bg-black text-white">Voir les affiches</div>
        </a>
        <a href="/tracking" className="rounded-2xl border p-6 hover:shadow-lg transition bg-white">
          <div className="text-2xl font-bold">tracking</div>
          <div className="text-slate-600 mt-1">Suivi en temps réel (admin, gérant, livreur, client)</div>
          <div className="mt-4 inline-block text-sm px-3 py-1.5 rounded bg-slate-900 text-white">Accéder</div>
        </a>
      </section>
    </main>
  );
}
