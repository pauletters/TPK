import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserDocument {
  _id: string;
  username: string;
  email: string;
  password: string;
  characters: string[]; // Array of Character IDs (reference)
  campaigns: string[]; // Array of Campaign IDs (reference)
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isCorrectPassword(password: string): Promise<boolean>;
}

// Schema for User
const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    characters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Character', // Reference to the Character model
      },
    ],
    campaigns: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Campaign', // Reference to the Campaign model
      },
    ],
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
    toJSON: {
      virtuals: true,
    },
  }
);


// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = model<UserDocument>('User', userSchema);


export default User;
