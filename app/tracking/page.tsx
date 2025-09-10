export default function TrackingHubPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <a href="/" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50">
          <span>←</span>
          <span>Retour</span>
        </a>
      </div>
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black">shaifai — tracking</h1>
        <p className="text-slate-600 mt-1">Choisissez un espace</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/manager" className="rounded-xl border p-5 hover:shadow bg-white">
          <div className="text-xl font-bold">Gérant</div>
          <div className="text-sm text-slate-600 mt-1">Créer et suivre les commandes</div>
        </a>
        <a href="/courier" className="rounded-xl border p-5 hover:shadow bg-white">
          <div className="text-xl font-bold">Livreur</div>
          <div className="text-sm text-slate-600 mt-1">Itinéraires et progression</div>
        </a>
      </section>
    </main>
  );
}
