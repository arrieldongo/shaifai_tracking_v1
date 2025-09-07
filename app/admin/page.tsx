"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import { apiFetch } from "@/lib/api";

type Restaurant = { id: string; name: string; zones: Array<"sud" | "centre"> };

export default function AdminPage() {
  const { loading } = useAuth();
  const [restos, setRestos] = useState<Restaurant[]>([]);
  const [name, setName] = useState("");
  const [zones, setZones] = useState<Record<string, boolean>>({ sud: true, centre: true });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"" | "manager" | "courier">("");
  const [rid, setRid] = useState("");
  const [courierId, setCourierId] = useState("");
  const [adminFlag, setAdminFlag] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "restaurants"), (snap) => {
      const list: Restaurant[] = snap.docs.map((d) => {
        const x = d.data() as any;
        return { id: d.id, name: x.name ?? "(sans nom)", zones: Array.isArray(x.zones) ? x.zones : [] };
      });
      setRestos(list);
    });
    return () => unsub();
  }, []);

  const createRestaurant = async () => {
    const z: ("sud" | "centre")[] = ["sud", "centre"].filter((k) => zones[k]);
    if (!name.trim()) return alert("Nom requis");
    try {
      // Doc id auto
      const data = { name: name.trim(), zones: z };
      await setDoc(doc(collection(db, "restaurants")), data);
      setName("");
    } catch (e: any) {
      alert(e.message || "Erreur création");
    }
  };

  const createUser = async () => {
    if (!email || !password) return alert("email & password requis");
    try {
      const res = await apiFetch<{ ok: true; uid: string }>("/api/admin/createUser", {
        method: "POST",
        body: JSON.stringify({ email, password, role: role || undefined, rid: rid || undefined, courierId: courierId || undefined, admin: adminFlag || undefined }),
      });
      setLogs((l) => [
        `User créé: ${(res as any).uid}`,
        ...l,
      ]);
      setEmail(""); setPassword("");
    } catch (e: any) {
      alert(e.message || "Erreur createUser");
    }
  };

  const setClaims = async () => {
    const uid = prompt("UID utilisateur ?");
    if (!uid) return;
    try {
      const res = await apiFetch("/api/admin/setClaims", {
        method: "POST",
        body: JSON.stringify({ uid, role: role || undefined, rid: rid || undefined, courierId: courierId || undefined, admin: adminFlag || undefined }),
      });
      setLogs((l) => [ `Claims posés sur ${uid}`, ...l ]);
    } catch (e: any) {
      alert(e.message || "Erreur setClaims");
    }
  };

  return (
    <RoleGuard require="admin" fallback={<div className="p-6 text-red-600">Accès admin requis</div>}>
      <main className="max-w-5xl mx-auto p-4 space-y-10">
        <h1 className="text-2xl font-bold">Administration</h1>

        <section className="space-y-3">
          <h2 className="font-semibold">Restaurants</h2>
          <div className="flex gap-2 items-center">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="border rounded p-2" />
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={zones.sud} onChange={(e) => setZones((z) => ({ ...z, sud: e.target.checked }))} /> Sud
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={zones.centre} onChange={(e) => setZones((z) => ({ ...z, centre: e.target.checked }))} /> Centre
            </label>
            <button onClick={createRestaurant} className="px-3 py-2 bg-black text-white rounded">Créer</button>
          </div>

          <ul className="text-sm divide-y">
            {restos.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-slate-600">{r.id} • Zones: {r.zones.join(", ") || '—'}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold">Utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="border rounded p-2" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mot de passe" className="border rounded p-2" />
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="border rounded p-2">
              <option value="">— rôle —</option>
              <option value="manager">manager</option>
              <option value="courier">courier</option>
            </select>
            <input value={rid} onChange={(e) => setRid(e.target.value)} placeholder="rid (si role)" className="border rounded p-2" />
            <input value={courierId} onChange={(e) => setCourierId(e.target.value)} placeholder="courierId (si courier)" className="border rounded p-2" />
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={adminFlag} onChange={(e) => setAdminFlag(e.target.checked)} /> admin
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={createUser} className="px-3 py-2 bg-black text-white rounded">Créer utilisateur</button>
            <button onClick={setClaims} className="px-3 py-2 bg-slate-800 text-white rounded">Mettre à jour claims</button>
          </div>

          {!!logs.length && (
            <div className="mt-3 bg-slate-50 border rounded p-3 text-xs space-y-1">
              {logs.map((l, i) => (<div key={i}>{l}</div>))}
            </div>
          )}
        </section>
      </main>
    </RoleGuard>
  );
}

