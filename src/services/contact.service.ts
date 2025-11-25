import { PrismaClient, Contact } from '@prisma/client';
import { createContactSchema, csvContactSchema } from '../validators/contact.validator';
import { z } from 'zod';

const prisma = new PrismaClient();

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ContactService {
  /**
   * Create a single contact
   */
  async createContact(data: z.infer<typeof createContactSchema>): Promise<Contact> {
    const validated = createContactSchema.parse(data);
    
    // Check for duplicate phone
    const existing = await prisma.contact.findUnique({
      where: { phone: validated.phone }
    });

    if (existing) {
      throw new Error('Contact with this phone number already exists');
    }

    return prisma.contact.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        bloodGroup: validated.bloodGroup || null,
        workingDivision: validated.workingDivision || null,
        designation: validated.designation || null,
        city: validated.city || null
      }
    });
  }

  /**
   * Update a single contact
   */
  async updateContact(
    id: string,
    data: Partial<z.infer<typeof createContactSchema>>
  ): Promise<Contact> {
    // Check if contact exists
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Contact not found');
    }

    // If phone is being updated, check for duplicates
    if (data.phone && data.phone !== existing.phone) {
      const phoneExists = await prisma.contact.findUnique({
        where: { phone: data.phone }
      });
      if (phoneExists) {
        throw new Error('Contact with this phone number already exists');
      }
    }

    return prisma.contact.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup || null }),
        ...(data.workingDivision !== undefined && { workingDivision: data.workingDivision || null }),
        ...(data.designation !== undefined && { designation: data.designation || null }),
        ...(data.city !== undefined && { city: data.city || null })
      }
    });
  }

  /**
   * Delete a single contact
   */
  async deleteContact(id: string): Promise<void> {
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new Error('Contact not found');
    }

    await prisma.contact.delete({ where: { id } });
  }

  /**
   * Delete all contacts
   */
  async deleteAllContacts(): Promise<{ count: number }> {
    return prisma.contact.deleteMany();
  }

  /**
   * Get all contacts with pagination
   */
  async getAllContacts(
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<Contact>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.contact.count()
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search contacts by name (partial, case-insensitive)
   */
  async searchByName(
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<Contact>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.contact.count({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        }
      })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Search contact by phone (exact match)
   */
  async searchByPhone(phone: string): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { phone }
    });
  }

  /**
   * Get total count of contacts
   */
  async getTotalCount(): Promise<number> {
    return prisma.contact.count();
  }

  /**
   * Bulk upload contacts from CSV data
   */
  async bulkUploadContacts(
    contacts: Array<z.infer<typeof csvContactSchema>>,
    replaceAll: boolean = false
  ): Promise<{ created: number; errors: Array<{ row: number; error: string }> }> {
    // If replaceAll is true, delete all existing contacts first
    if (replaceAll) {
      await prisma.contact.deleteMany();
    }

    const errors: Array<{ row: number; error: string }> = [];
    const validContacts: Array<z.infer<typeof csvContactSchema>> = [];
    const phoneSet = new Set<string>();

    // Validate and deduplicate contacts
    contacts.forEach((contact, index) => {
      try {
        const validated = csvContactSchema.parse(contact);
        
        // Check for duplicates within the batch
        if (phoneSet.has(validated.phone)) {
          errors.push({
            row: index + 1,
            error: `Duplicate phone number in CSV: ${validated.phone}`
          });
          return;
        }

        phoneSet.add(validated.phone);
        validContacts.push(validated);
      } catch (error) {
        errors.push({
          row: index + 1,
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    });

    if (validContacts.length === 0) {
      return { created: 0, errors };
    }

    // Prepare data for bulk insert
    const dataToInsert = validContacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || null,
      bloodGroup: contact.bloodGroup || null,
      workingDivision: contact.workingDivision || null,
      designation: contact.designation || null,
      city: contact.city || null
    }));

    // Optimize bulk insertion based on replaceAll flag
    try {
      if (replaceAll) {
        // If replacing all, we can use createMany with skipDuplicates for better performance
        // Since we already deleted all records, duplicates only exist within the batch
        const result = await prisma.contact.createMany({
          data: dataToInsert,
          skipDuplicates: true
        });
        return {
          created: result.count,
          errors
        };
      } else {
        // For incremental updates, use upsert in batches for better performance
        // Process in chunks of 500 to avoid transaction timeout
        const chunkSize = 500;
        let created = 0;
        
        for (let i = 0; i < dataToInsert.length; i += chunkSize) {
          const chunk = dataToInsert.slice(i, i + chunkSize);
          await prisma.$transaction(
            chunk.map(data =>
              prisma.contact.upsert({
                where: { phone: data.phone },
                update: data,
                create: data
              })
            )
          );
          created += chunk.length;
        }

        return {
          created,
          errors
        };
      }
    } catch (error) {
      // Fallback: try individual inserts for better error reporting
      let created = 0;
      for (let i = 0; i < dataToInsert.length; i++) {
        try {
          await prisma.contact.upsert({
            where: { phone: dataToInsert[i].phone },
            update: dataToInsert[i],
            create: dataToInsert[i]
          });
          created++;
        } catch (err) {
          const originalIndex = validContacts.findIndex(
            vc => vc.phone === dataToInsert[i].phone
          );
          errors.push({
            row: originalIndex >= 0 ? contacts.indexOf(validContacts[originalIndex]) + 1 : i + 1,
            error: err instanceof Error ? err.message : 'Insert failed'
          });
        }
      }
      return { created, errors };
    }
  }
}

export const contactService = new ContactService();

