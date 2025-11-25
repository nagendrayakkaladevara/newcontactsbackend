import { z } from 'zod';

// Single contact validation schema
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  bloodGroup: z.string().max(10).optional().or(z.literal('')),
  workingDivision: z.string().max(255).optional().or(z.literal('')),
  designation: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(255).optional().or(z.literal(''))
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid('Invalid contact ID')
});

export const contactIdSchema = z.object({
  id: z.string().uuid('Invalid contact ID')
});

// CSV row validation schema
export const csvContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  workingDivision: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal(''))
});

// Query parameters validation
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50')
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50')
});

export const deleteAllSchema = z.object({
  confirm: z.string().refine(val => val === 'DELETE_ALL', {
    message: 'Confirmation key is required. Use confirm=DELETE_ALL'
  })
});

