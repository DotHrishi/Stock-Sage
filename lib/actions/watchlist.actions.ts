'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function toggleWatchlist(symbol: string, company: string): Promise<{ success: boolean, isAdded: boolean, message?: string }> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, isAdded: false, message: 'Unauthorized' };
    }

    const userId = session.user.id;
    if (!userId) {
      return { success: false, isAdded: false, message: 'Unauthorized' };
    }

    await connectToDatabase();

    const existing = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
    
    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
      return { success: true, isAdded: false };
    } else {
      await Watchlist.create({
        userId,
        symbol: symbol.toUpperCase(),
        company
      });
      return { success: true, isAdded: true };
    }
  } catch (err: any) {
    console.error('toggleWatchlist error:', err);
    return { success: false, isAdded: false, message: err.message };
  }
}

export async function getWatchlistStocks(): Promise<{ symbol: string, company: string }[]> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) return [];
    
    await connectToDatabase();
    
    const items = await Watchlist.find({ userId: session.user.id }, { symbol: 1, company: 1 }).sort({ addedAt: -1 }).lean();
    return items.map(i => ({ symbol: i.symbol, company: i.company }));
  } catch (err) {
    console.error('getWatchlistStocks error:', err);
    return [];
  }
}