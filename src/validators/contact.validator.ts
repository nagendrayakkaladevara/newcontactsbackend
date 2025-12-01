import { z } from 'zod';

// Single contact validation schema
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  bloodGroup: z.string().max(10).optional().or(z.literal('')),
  lobby: z.string().max(255).optional().or(z.literal('')),
  designation: z.string().max(255).optional().or(z.literal(''))
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid('Invalid contact ID')
});

export const contactIdSchema = z.object({
  id: z.string().uuid('Invalid contact ID')
});

// CSV row validation schema - accepts flexible field names
export const csvContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format'),
  bloodGroup: z.string().optional().or(z.literal('')),
  lobby: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal(''))
}).passthrough(); // Allow extra fields to be ignored (like 'sno')

// Query parameters validation
export const paginationSchema = z.object({
  page: z.preprocess(
    (val) => {
      if (!val) return 1;
      const num = Number(val);
      return isNaN(num) ? 1 : num;
    },
    z.number().int().positive().default(1)
  ),
  limit: z.preprocess(
    (val) => {
      if (!val) return 50;
      const num = Number(val);
      return isNaN(num) ? 50 : num;
    },
    z.number().int().positive().max(100).default(50)
  )
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.preprocess(
    (val) => {
      if (!val) return 1;
      const num = Number(val);
      return isNaN(num) ? 1 : num;
    },
    z.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => {
      if (!val) return 50;
      const num = Number(val);
      return isNaN(num) ? 50 : num;
    },
    z.number().int().positive().max(100).optional().default(50)
  )
});

export const deleteAllSchema = z.object({
  confirm: z.string().refine(val => val === 'DELETE_ALL', {
    message: 'Confirmation key is required. Use confirm=DELETE_ALL'
  })
});

