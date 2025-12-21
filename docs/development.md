# Development Guide

This guide covers the development workflow, coding standards, and best practices for contributing to the Contact Management API.

## Development Setup

### Prerequisites

- Node.js 18.18.0+
- PostgreSQL 12+
- Git
- Code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd newcontactsbackend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Project Structure

```
src/
├── config/          # Configuration and environment
├── controllers/     # Request/response handlers
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic
├── validators/      # Zod validation schemas
└── index.ts         # Application entry point

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Migration files

docs/                # Documentation
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types (avoid `any`)
- Use interfaces for object shapes
- Use enums for constants

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Maximum line length: 100 characters
- Use meaningful variable names

### File Naming

- Use kebab-case for files: `contact.controller.ts`
- Use PascalCase for classes: `ContactController`
- Use camelCase for functions: `getAllContacts`

## Architecture Patterns

### Controller Pattern

Controllers should be thin - they handle HTTP concerns only:

```typescript
async createContact(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createContactSchema.parse(req.body);
    const contact = await contactService.createContact(data);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}
```

### Service Pattern

Services contain business logic:

```typescript
async createContact(data: CreateContactInput): Promise<Contact> {
  // Business logic here
  const existing = await prisma.contact.findUnique({
    where: { phone: data.phone }
  });
  
  if (existing) {
    throw new AppError('Contact already exists', 409);
  }
  
  return prisma.contact.create({ data });
}
```

### Validation Pattern

Use Zod schemas for validation:

```typescript
export const createContactSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^[+]?[\d\s-()]+$/)
});
```

## Adding New Features

### 1. Database Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Generate Prisma client: `npm run prisma:generate`

### 2. Add Validation Schema

Create or update schema in `src/validators/`:

```typescript
export const newFeatureSchema = z.object({
  field: z.string().min(1)
});
```

### 3. Add Service Method

Add business logic in `src/services/`:

```typescript
async newFeature(data: NewFeatureInput): Promise<Result> {
  // Implementation
}
```

### 4. Add Controller Method

Add HTTP handler in `src/controllers/`:

```typescript
async newFeature(req: Request, res: Response, next: NextFunction) {
  try {
    const data = newFeatureSchema.parse(req.body);
    const result = await service.newFeature(data);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

### 5. Add Route

Add route in `src/routes/`:

```typescript
router.post('/new-feature', controller.newFeature.bind(controller));
```

## Testing

### Manual Testing

Use Postman or cURL:

```bash
curl -H "X-API-Key: your-key" \
  http://localhost:3000/api/contacts
```

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

## Database Migrations

### Create Migration

After modifying `schema.prisma`:

```bash
npm run prisma:migrate
```

This will:
1. Create migration file
2. Apply migration to database
3. Generate Prisma client

### Migration Best Practices

- Always test migrations on development first
- Never modify existing migration files
- Create new migration for schema changes
- Review migration SQL before applying

## Error Handling

### Custom Errors

Use `AppError` for custom errors:

```typescript
throw new AppError('Error message', 400, 'ERROR_CODE');
```

### Error Handler

Centralized error handling in `src/middleware/errorHandler.ts`:
- Formats consistent error responses
- Logs errors
- Never exposes sensitive information

## Security Considerations

### Input Validation

- Always validate inputs with Zod
- Sanitize user inputs
- Use parameterized queries (Prisma handles this)

### Authentication

- All endpoints require authentication (except health check)
- Use API key or Basic auth
- Include CSRF token for state-changing operations

### Rate Limiting

- General: 100 req/min
- Bulk: 10 req/min
- Strict: 5 req/min

## Performance

### Database Queries

- Use indexes for frequently queried fields
- Use `findMany` with `skip`/`take` for pagination
- Use `Promise.all` for parallel queries
- Avoid N+1 queries

### Caching

Consider caching for:
- Frequently accessed data
- Expensive computations
- Static data

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/refactoring-description` - Refactoring

### Commit Messages

Follow conventional commits:

```
feat: add phone search endpoint
fix: resolve duplicate contact issue
docs: update API documentation
refactor: simplify contact service
```

### Pull Requests

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Create pull request
6. Address review comments

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] Input validation is present
- [ ] Error handling is proper
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] No console.logs in production code
- [ ] Tests pass (if applicable)

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Logging

Use console.log for development (remove for production):

```typescript
console.log('Debug info:', data);
```

For production, use structured logging (Winston, Pino).

## Common Tasks

### Add New Endpoint

1. Add route in `src/routes/`
2. Add controller method
3. Add service method
4. Add validation schema
5. Update documentation

### Modify Database Schema

1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Update TypeScript types (auto-generated)

### Add Middleware

1. Create middleware in `src/middleware/`
2. Add to `src/index.ts` middleware stack
3. Document in architecture docs

## Best Practices

### 1. Keep Controllers Thin

Controllers should only handle HTTP concerns, delegate to services.

### 2. Single Responsibility

Each function should do one thing well.

### 3. DRY (Don't Repeat Yourself)

Extract common logic into reusable functions.

### 4. Error Handling

Always handle errors properly, use try-catch blocks.

### 5. Type Safety

Use TypeScript types, avoid `any`.

### 6. Validation

Validate all inputs with Zod schemas.

### 7. Security

Never trust user input, always validate and sanitize.

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)

## Getting Help

- Check existing documentation
- Review similar code in the codebase
- Ask in team chat/forum
- Create an issue for bugs

