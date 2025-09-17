# Coding Standards

A minimal set of critical rules will be automatically enforced via a shared ESLint preset and a manual Pull Request template checklist.

## Critical Rules

- **Enforce the use of the `@smartlabel/shared` package for types**
- **TanStack Query for data fetching**
- **Secure pattern for AI prompting**

## Naming Conventions

Standardized naming for:
- Components (PascalCase)
- Hooks (camelCase with `use` prefix)
- API routes (kebab-case)
- Database tables (PascalCase with hyphen separation)

## Component Standards

- Use TypeScript interfaces from `@smartlabel/shared`
- Implement proper error boundaries
- Follow React Hook Form patterns for forms
- Use Tailwind CSS for styling consistency

## API Standards

- Validate all inputs with Zod schemas
- Use proper HTTP status codes
- Implement consistent error handling
- Follow REST conventions

## Security Standards

- Never expose sensitive data in client code
- Validate all AI responses before processing
- Use proper IAM roles with least privilege
- Implement rate limiting on API endpoints