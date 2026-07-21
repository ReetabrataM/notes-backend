import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
  themePreference: 'light' | 'dark' | 'amoled' | 'system';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  googleId?: string;
  role: 'user' | 'admin';
  isSuspended: boolean;
  tokenVersion: number;
  lastLoginAt?: Date;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    reminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: function (this: any) { return !this.googleId; }, minlength: 8, select: false },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 280 },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'amoled', 'system'],
      default: 'system',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isSuspended: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    notificationSettings: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// email and username already get unique indexes from `unique: true` above —
// no need to declare them again here (that was causing duplicate-index warnings).

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);
