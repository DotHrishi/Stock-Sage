import { NextResponse } from 'next/server';
import { getSectors } from '@/lib/actions/fyers.actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await getSectors();
        return NextResponse.json({ data, updatedAt: Date.now() });
    } catch (err) {
        console.error('Sectors fetch error:', err);
        return NextResponse.json({ data: [], updatedAt: Date.now() }, { status: 500 });
    }
}
