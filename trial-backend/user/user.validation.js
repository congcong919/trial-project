const { passwordSchema } = require('../utils/auth.validation');
const { z } = require('zod');

// PATCH
// ignore unknown
const updateMeSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  displayName: z.string().trim().optional(),
  role: z.enum(['Student', 'Other']).optional(),
  field: z.enum(['FE', 'BE']).optional(),
  goal: z.string().trim().optional(),
});

const updateMyPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

const updateAvatarSchema = z.object({
  fileKey: z.string().min(1),
});

module.exports = {
  updateMeSchema,
  updateMyPasswordSchema,
  updateAvatarSchema,
};