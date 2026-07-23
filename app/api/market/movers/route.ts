import { NextResponse } from 'next/server';
import { getTopMovers } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getTopMovers();
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Top movers fetch error:', err);
        return NextResponse.json({ data: { gainers: [], losers: [] }, updatedAt: Date.now() }, { status: 500 });
    }
}
