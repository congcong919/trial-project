const { z } = require('zod');

const emailSchema = z.email('Invalid email format').toLowerCase().trim();
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'at least 6 characters Password is required '),
});

// const forgotPasswordSchema = z.object({
//   email: emailSchema,
// });

// const verifyCodeSchema = z.object({
//   email: emailSchema,
//   code: z.string().length(6, 'Code must be 6 digits'),
// });

// const resetPasswordSchema = z.object({
//   email: emailSchema,
//   resetToken: z.string().min(1, 'Reset token is required'),
//   newPassword: passwordSchema,
// });

module.exports = {
  registerSchema,
  loginSchema,
//   forgotPasswordSchema,
//   verifyCodeSchema,
//   resetPasswordSchema,
  passwordSchema,
};