import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface WatchlistItem extends Document {
  userId: string;
  groupId?: Schema.Types.ObjectId;
  symbol: string;
  company: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>(
  {
    userId: { type: String, required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'WatchlistGroup', index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Prevent duplicate symbols per user per group
WatchlistSchema.index({ userId: 1, groupId: 1, symbol: 1 }, { unique: true });

if (models?.Watchlist) {
  delete models.Watchlist;
}

export const Watchlist: Model<WatchlistItem> = model<WatchlistItem>('Watchlist', WatchlistSchema);