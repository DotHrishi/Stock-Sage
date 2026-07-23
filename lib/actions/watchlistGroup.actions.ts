'use server';

import { connectToDatabase } from '@/database/mongoose';
import { WatchlistGroup } from '@/database/models/watchlistGroup.model';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistGroups(): Promise<{ _id: string, name: string }[]> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) return [];
    
    await connectToDatabase();
    const userId = session.user.id;

    // Fetch existing groups
    let groups = await WatchlistGroup.find({ userId }).sort({ createdAt: 1 }).lean();

    // Migration for existing users: if they have watchlisted items but no groups
    if (groups.length === 0) {
      const existingItems = await Watchlist.countDocuments({ userId });
      if (existingItems > 0) {
        // Create default group
        const defaultGroup = await WatchlistGroup.create({
          userId,
          name: 'My Watchlist'
        });
        groups = [defaultGroup.toObject()];

        // Migrate old items
        await Watchlist.updateMany(
          { userId, groupId: { $exists: false } },
          { $set: { groupId: defaultGroup._id } }
        );
      } else {
          // If they have no items, let's still give them a default watchlist
          const defaultGroup = await WatchlistGroup.create({
              userId,
              name: 'My Watchlist'
          });
          groups = [defaultGroup.toObject()];
      }
    }

    return groups.map(g => ({
      _id: g._id.toString(),
      name: g.name
    }));
  } catch (err) {
    console.error('getWatchlistGroups error:', err);
    return [];
  }
}

export async function createWatchlistGroup(name: string): Promise<{ success: boolean, message?: string, group?: any }> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) return { success: false, message: 'Unauthorized' };
    
    await connectToDatabase();
    const userId = session.user.id;

    const group = await WatchlistGroup.create({
      userId,
      name: name.trim()
    });

    return { success: true, group: { _id: group._id.toString(), name: group.name } };
  } catch (err: any) {
    console.error('createWatchlistGroup error:', err);
    return { success: false, message: err.message };
  }
}

export async function renameWatchlistGroup(groupId: string, newName: string): Promise<{ success: boolean, message?: string }> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) return { success: false, message: 'Unauthorized' };
    
    await connectToDatabase();
    const userId = session.user.id;

    await WatchlistGroup.findOneAndUpdate(
      { _id: groupId, userId },
      { name: newName.trim() }
    );

    return { success: true };
  } catch (err: any) {
    console.error('renameWatchlistGroup error:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteWatchlistGroup(groupId: string): Promise<{ success: boolean, message?: string }> {
  try {
    const { auth } = await import('@/lib/better-auth/auth');
    const { headers } = await import('next/headers');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) return { success: false, message: 'Unauthorized' };
    
    await connectToDatabase();
    const userId = session.user.id;

    const group = await WatchlistGroup.findOneAndDelete({ _id: groupId, userId });
    
    if (group) {
        // Delete all items in this group
        await Watchlist.deleteMany({ groupId, userId });
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteWatchlistGroup error:', err);
    return { success: false, message: err.message };
  }
}
