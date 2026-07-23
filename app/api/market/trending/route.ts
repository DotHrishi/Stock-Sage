import { NextResponse } from 'next/server';
import { getTrendingStocks } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getTrendingStocks();
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Trending stocks fetch error:', err);
        return NextResponse.json({ data: [], updatedAt: Date.now() }, { status: 500 });
    }
}
