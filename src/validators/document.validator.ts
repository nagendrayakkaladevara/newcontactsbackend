import { z } from 'zod';

// Create document validation schema
export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(500, 'Document title is too long'),
  link: z.string().url('Invalid document link URL').min(1, 'Document link is required'),
  uploadedBy: z.string().max(255).optional().or(z.literal(''))
});

// Update document validation schema
export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().uuid('Invalid document ID')
});

// Document ID validation schema
export const documentIdSchema = z.object({
  id: z.string().uuid('Invalid document ID')
});

// Pagination schema (reuse from contact validator or define here)
export const documentPaginationSchema = z.object({
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

// Search schema
export const documentSearchSchema = z.object({
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

