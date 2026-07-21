import { Schema, model, models } from 'mongoose';

const UserPreferencesSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sectors: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const UserPreferences = models.UserPreferences || model('UserPreferences', UserPreferencesSchema);

export default UserPreferences;
