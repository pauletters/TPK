import { Schema, model } from 'mongoose';

// Campaign Interface
export interface CampaignDocument {
  _id: string;
  name: string;
  description?: string; // Optional: A short description of the campaign
  players: string[]; // Array of Character IDs (references)
  milestones: string[]; // Campaign events or progress notes
  createdBy: string; // User ID (reference)
  createdAt?: Date;
  updatedAt?: Date;
}

// Campaign Schema
const campaignSchema = new Schema<CampaignDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500, // Optional: Limit the length of the description
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Character', // References Character model
      },
    ],
    milestones: [
      {
        type: String, // Stores text describing major events or progress
      },
    ],
    createdBy: {
      type: Schema.Types.String,
      ref: 'User', // References User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to count the number of players in a campaign
campaignSchema.virtual('playerCount').get(function () {
  return this.players.length;
});

// Campaign Model
const Campaign = model<CampaignDocument>('Campaign', campaignSchema);

export default Campaign;
