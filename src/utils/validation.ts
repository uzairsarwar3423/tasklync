import { z } from 'zod';

export const phoneSchema = z.string()
  .transform(val => val.replace(/\s|-/g, ''))
  .refine(val => /^(03|3)[0-9]{9}$/.test(val), {
    message: 'Please enter a valid Pakistani mobile number',
  });

export const otpSchema = z.string()
  .length(6, { message: 'Please enter all 6 digits' })
  .regex(/^[0-9]{6}$/, { message: 'Please enter all 6 digits' });

export const nameSchema = z.string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(50, { message: 'Name must be 50 characters or less' })
  .transform(val => val.trim())
  .refine(val => val.length >= 2, { message: 'Please enter your name' });
