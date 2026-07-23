import { NextResponse } from 'next/server';
import { getMarketIndices } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getMarketIndices();
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Market indices fetch error:', err);
        return NextResponse.json({ data: [], updatedAt: Date.now() }, { status: 500 });
    }
}
