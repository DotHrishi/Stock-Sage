import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface WatchlistGroup extends Document {
  userId: string;
  name: string;
  createdAt: Date;
}

const WatchlistGroupSchema = new Schema<WatchlistGroup>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Prevent duplicate names per user
WatchlistGroupSchema.index({ userId: 1, name: 1 }, { unique: true });

export const WatchlistGroup: Model<WatchlistGroup> =
  (models?.WatchlistGroup as Model<WatchlistGroup>) || model<WatchlistGroup>('WatchlistGroup', WatchlistGroupSchema);
