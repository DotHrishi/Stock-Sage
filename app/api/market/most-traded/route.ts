import { NextResponse } from 'next/server';
import { getMostTraded } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getMostTraded();
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Most traded fetch error:', err);
        return NextResponse.json({ data: [], updatedAt: Date.now() }, { status: 500 });
    }
}
