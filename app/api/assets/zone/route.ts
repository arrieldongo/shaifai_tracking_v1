import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET /api/assets/zone?zone=centre|sud
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = (searchParams.get('zone') || '').toLowerCase();
    if (zone !== 'centre' && zone !== 'sud') {
      return NextResponse.json({ error: 'invalid zone' }, { status: 400 });
    }

    const dir = path.join(process.cwd(), 'public', zone);
    let files: string[] = [];
    try {
      files = fs
        .readdirSync(dir)
        .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
        .map((f) => `/${zone}/${f}`);
    } catch {
      files = [];
    }

    // Build a simple map for name lookup (case/underscore insensitive)
    const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const nameFromUrl = (u: string) => {
      const base = u.split('/').pop() || '';
      const noExt = base.replace(/\.[^.]+$/, '');
      return normalize(noExt);
    };
    const map: Record<string, string> = {};
    for (const u of files) {
      const key = nameFromUrl(u);
      map[key] = u;
      // Compatibility key for activite_libre
      if (key === 'activitelibre') map['activite_libre'.replace(/[^a-z0-9]/gi, '').toLowerCase()] = u;
    }

    return NextResponse.json({ zone, files, map });
  } catch (e) {
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}

