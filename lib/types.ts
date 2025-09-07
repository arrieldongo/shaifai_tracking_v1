// lib/types.ts
export type Zone = 'sud' | 'centre';
export type PaymentMethod = 'cash' | 'wave' | 'orange_money' | 'mtn_money' | 'moov_money';
export type OrderStatus = 'pending' | 'done';
export type StepStatus = "upcoming" | "in_progress" | "reached";
export type StepKind = "fixed" | "order";

export type Courier = {
  id: string;
  rid: string;
  name?: string;
  currentStepId?: string | null;
  updatedAt?: number;
};

export type Step = {
  id: string;           // unique (orderId ou id fixe)
  label: string;        // ex: "Portail principal centre"
  image: string;        // chemin /public/... (ex: /itineraireCentre/portail.png)
  color: string;        // hex (ex: #F97316) -> couleur du trait
  status: StepStatus;   // upcoming / in_progress / reached
  kind: StepKind;       // 'fixed' ou 'order'
};

export function zoneAsset(zone: Zone, name: string) {
  // ex: zoneAsset('centre','portail') => /itineraireCentre/portail.png
  const dir = zone === "centre" ? "itineraireCentre" : "itineraireSud";
  return `/${dir}/${name}.png`;
}

export type Order = {
  id?: string; // optionnel à la création

  clientCode: string;
  zone: Zone;

  // Destination désormais via la chambre
  roomNumber?: string; // requis à la création, mais optionnel dans le type pour compat rétro
  phone?: string;      // idem

  // (Ancien) destinationStepIndex non utilisé pour l’ordre, peut exister encore sur d’anciens docs
  destinationStepIndex?: number;

  // Workflow
  assigned?: boolean;            // false par défaut
  assignedAt?: number | null;
  status: OrderStatus;

  // Tri manuel partagé
  priority?: number;             // utilisé quand assigned = true

  // ICI supprimé (position gérée par currentStepId du livreur)

  // Infos optionnelles
  customerName?: string;
  description?: string;
  price?: number; // FCFA
  paymentMethod?: PaymentMethod;
  notes?: string;

  rid?: string; // restaurant owner id (lecture côté client via hooks)
  createdAt?: number;
  updatedAt?: number;
};
