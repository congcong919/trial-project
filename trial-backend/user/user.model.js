const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // unique index -> _id
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Student', 'Other'],
    },
    field: { type: String, enum: ['FE', 'BE'] },
    goal: { type: String, trim: true },
    avatar: { type: String }, // url
    displayName: { type: String, trim: true },
    accountType: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    resetCode: {
      type: String,
    },
    resetCodeExpiry: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    passwordHistory: {
      type: [String],
      default: [],
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        // ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret.passwordHistory;
        if (process.env.CLOUDFRONT_URL) {
          ret.avatar = `https://${process.env.CLOUDFRONT_URL}/${ret.avatar}`;
        }
      },
    },
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
