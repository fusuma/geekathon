# Source Tree

The monorepo file structure is organized for clarity and separation of concerns. A "Developer Onboarding" guide will be added to the root `README.md` to explain the layout.

```plaintext
smartlabel-ai/
├── apps/
│   ├── api/                  # AWS SAM Serverless Application
│   │   ├── src/
│   │   │   └── handlers/
│   │   │       ├── generate.ts
│   │   │       ├── crisis.ts
│   │   │       └── translate.ts
│   │   └── template.yaml      # IaC definition
│   └── web/                  # Next.js Frontend Application
│       ├── src/
│       │   └── app/
│       └── ...
├── packages/
│   ├── shared/               # Shared TypeScript types
│   ├── ui/                   # Shared React component library
│   └── config/               # Shared configurations (ESLint, etc.)
├── package.json
└── turbo.json
```

## Key Directories

### `apps/api/`
Contains the serverless backend application managed by AWS SAM:
- **`src/handlers/`**: Lambda function implementations
- **`template.yaml`**: Infrastructure as Code definitions

### `apps/web/`
Contains the Next.js frontend application:
- **`src/app/`**: Next.js App Router pages and layouts
- **`src/components/`**: React components specific to the web app

### `packages/shared/`
Contains shared TypeScript types and utilities:
- **`types/`**: Data model interfaces
- **`utils/`**: Shared utility functions

### `packages/ui/`
Contains reusable React components:
- **`components/`**: Shared UI components using shadcn/ui
- **`hooks/`**: Shared React hooks

### `packages/config/`
Contains shared configuration files:
- **`eslint/`**: ESLint configurations
- **`typescript/`**: TypeScript configurations