import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  hashedPassword?: string;
  avatarUrl?: string;
  plan: "free" | "starter" | "growth" | "agency";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: Date;
  usage: {
    contentGenerated: number;
    postsPublished: number;
    storageUsedMB: number;
    periodStart: Date;
    periodEnd: Date;
  };
  defaults: {
    language: string;
    timezone: string;
    defaultTone?: string;
    defaultNiche?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Nombre es requerido"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    hashedPassword: {
      type: String,
      select: false,
    },
    avatarUrl: String,
    plan: {
      type: String,
      enum: ["free", "starter", "growth", "agency"],
      default: "free",
    },
    stripeCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },
    stripeSubscriptionId: String,
    planExpiresAt: Date,
    usage: {
      contentGenerated: { type: Number, default: 0 },
      postsPublished: { type: Number, default: 0 },
      storageUsedMB: { type: Number, default: 0 },
      periodStart: { type: Date, default: Date.now },
      periodEnd: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    defaults: {
      language: { type: String, default: "es" },
      timezone: { type: String, default: "America/Tegucigalpa" },
      defaultTone: String,
      defaultNiche: String,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
