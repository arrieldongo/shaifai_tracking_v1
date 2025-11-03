// app/api/createOrder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, assertRole, getClaimsFromRequest } from "@/lib/apiAuth";
import { writePublicOrder } from "@/lib/publicMirror";

type Body = {
  clientCode?: string;
  zone: "sud" | "centre";
  roomNumber?: string;
  phone?: string;
  priority?: number;
  // Extras
  customerName?: string;
  description?: string;
  price?: number;
  paymentMethod?: 'cash' | 'wave' | 'orange_money' | 'mtn_money' | 'moov_money';
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    const claims = await getClaimsFromRequest(req);
    assertRole(claims, "manager"); // admin passe

    const { clientCode, zone, roomNumber, phone, priority, customerName, description, price, paymentMethod, notes } = (await req.json()) as Body;
    if (!zone || !["sud", "centre"].includes(zone)) {
      return NextResponse.json({ error: "invalid_zone" }, { status: 400 });
    }
    if (!claims.rid) {
      return NextResponse.json({ error: "missing_rid" }, { status: 400 });
    }

    const now = Date.now();
    const ref = adminDb.collection("orders").doc();
    const order = {
      rid: claims.rid,
      clientCode: clientCode?.trim() || null,
      roomNumber: roomNumber?.trim() || null,
      phone: phone?.trim() || null,
      zone,
      status: "pending" as const,
      assigned: false,
      assignedAt: null,
      priority: typeof priority === "number" ? priority : 999999,
      // Extras (optionnels)
      customerName: customerName?.trim() || null,
      description: description?.trim() || null,
      price: typeof price === 'number' ? price : null,
      paymentMethod: paymentMethod ?? null,
      notes: notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(order);

    // Miroir public (lecture client)
    await writePublicOrder(adminDb, ref.id, {
      id: ref.id,
      clientCode: order.clientCode ?? undefined,
      zone: order.zone,
      roomNumber: order.roomNumber ?? undefined,
      status: order.status,
      rid: claims.rid,
      assigned: false,
      priority: order.priority,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e?.message || "server_error" }, { status: 500 });
  }
}

/*
Aperçu:
- Manager crée une commande dans orders/ (rid des claims).
- Écrit immédiatement le miroir public public/orders/{id}.
*/
