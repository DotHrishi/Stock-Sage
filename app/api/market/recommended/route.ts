import { NextResponse } from 'next/server';
import { getStocksBySectors } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) ?? [];
        const data = await getStocksBySectors(sectors);
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Recommended stocks fetch error:', err);
        return NextResponse.json({ data: [], updatedAt: Date.now() }, { status: 500 });
    }
}
