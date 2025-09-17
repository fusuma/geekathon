# SmartLabel AI - Steel Thread Implementation

A modern monorepo implementation proving end-to-end connectivity for the SmartLabel AI project using Turborepo, Next.js, and AWS Lambda.

## 🎯 Steel Thread Goals

This implementation establishes the foundational architecture and proves end-to-end connectivity:

- ✅ **Turborepo Monorepo**: Configured workspace with shared types and packages
- ✅ **Next.js Frontend**: React app with TanStack Query and Tailwind CSS
- ✅ **AWS Lambda Backend**: TypeScript Lambda functions with SAM configuration
- ✅ **End-to-End Connectivity**: Frontend → API → Response flow working
- ✅ **Shared Types**: TypeScript interfaces shared between frontend and backend
- ✅ **Development Workflow**: Local development environment ready

## 🏗️ Architecture

```
SmartLabel AI (Monorepo)
├── apps/
│   ├── web/                 # Next.js Frontend (Port 3000)
│   └── api/                 # AWS Lambda Backend (Port 3001)
├── packages/
│   ├── shared/              # Shared TypeScript types
│   ├── ui/                  # Shared React components
│   ├── eslint-config/       # ESLint configuration
│   └── typescript-config/   # TypeScript configuration
└── docs/                    # Project documentation (BMad Method)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8.x
- **Git**

### Installation & Setup

```bash
# Clone and navigate to project
git clone <repository-url>
cd geekathon

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Start development servers (both frontend and backend)
pnpm dev
```

### Development Servers

The `pnpm dev` command starts both services concurrently:

- **Frontend**: http://localhost:3000 (Next.js app)
- **Backend**: http://localhost:3001 (Lambda dev server)

Or start them individually:

```bash
# Frontend only
pnpm dev:frontend

# Backend only
pnpm dev:backend
```

## 🧪 Testing the Steel Thread

1. **Start Development Servers**:
   ```bash
   pnpm dev
   ```

2. **Open Frontend**: Visit http://localhost:3000

3. **Test API Connection**: Click "Call Hello API" button

4. **Verify Response**: You should see:
   ```json
   {
     "message": "Hello from SmartLabel AI Steel Thread!",
     "timestamp": "2025-09-17T14:41:36.584Z",
     "version": "1.0.0"
   }
   ```

5. **Direct API Test**:
   ```bash
   curl http://localhost:3001/hello
   ```

## 📦 Package Structure

### Apps

- **`apps/web`**: Next.js frontend application
  - React 19 with TypeScript
  - TanStack Query for API calls
  - Tailwind CSS for styling
  - Shared types from `@repo/shared`

- **`apps/api`**: AWS Lambda backend
  - TypeScript Lambda functions
  - Express dev server for local development
  - SAM template for AWS deployment
  - CORS enabled for frontend integration

### Packages

- **`packages/shared`**: Shared TypeScript types and schemas
  - `HelloWorldResponse` interface
  - Zod validation schemas
  - Built with tsup for dual CJS/ESM output

- **`packages/ui`**: Shared React components (Turborepo default)
- **`packages/eslint-config`**: ESLint configurations
- **`packages/typescript-config`**: TypeScript configurations

## 🛠️ Development Scripts

### Root Scripts

```bash
pnpm dev              # Start both frontend and backend
pnpm dev:frontend     # Start frontend only (port 3000)
pnpm dev:backend      # Start backend only (port 3001)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm check-types      # Type-check all packages
```

### Package-Specific Scripts

```bash
# Build shared types
pnpm --filter=@repo/shared build

# Start frontend development
pnpm --filter=web dev

# Start backend development
pnpm --filter=@repo/api dev
```

## 🔧 Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Monorepo** | Turborepo | Latest | Build system and task runner |
| **Package Manager** | pnpm | 8.x | Fast, efficient package management |
| **Frontend Framework** | Next.js | 14.x | React framework with App Router |
| **UI Library** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **State Management** | TanStack Query | v5 | Server state management |
| **Backend Runtime** | Node.js | 20.x LTS | JavaScript runtime for Lambda |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Build Tool** | tsup | Latest | TypeScript bundler |
| **Infrastructure** | AWS SAM | Latest | Serverless application model |

## 🔄 Development Workflow

1. **Make Changes**: Edit code in any package
2. **Auto-Rebuild**: Packages rebuild automatically
3. **Hot Reload**: Frontend refreshes with changes
4. **Type Safety**: Shared types ensure consistency
5. **Test Integration**: API changes reflect immediately

## 📁 Key Files

- **`package.json`**: Root workspace configuration
- **`turbo.json`**: Turborepo build configuration
- **`pnpm-workspace.yaml`**: Workspace package definitions
- **`apps/web/app/page.tsx`**: Main frontend page with API integration
- **`apps/api/src/handlers/hello.ts`**: Lambda function handler
- **`packages/shared/src/types.ts`**: Shared TypeScript interfaces

## 🚀 Next Steps

This Steel Thread implementation provides the foundation for:

1. **Story 1.2**: Core AI Generation Engine (Backend)
2. **Story 1.3**: Functional UI Implementation
3. **Epic 2**: Global markets, polished UI, and Crisis Response

The architecture is ready for rapid feature development following the BMad Method workflow.

## 📖 BMad Method Integration

This project follows the BMad Method for AI-driven development:

- **Sharded Documentation**: See `docs/` directory
- **Story-Driven Development**: Complete stories in `docs/stories/`
- **Architecture Context**: Available in `docs/architecture/`
- **Shared Types**: Centralized in `packages/shared`

## 🤝 Contributing

1. Create feature branches from `main`
2. Follow existing code patterns and TypeScript standards
3. Test changes with `pnpm dev`
4. Ensure all packages build with `pnpm build`
5. Submit PR with clear description

---

**Steel Thread Status**: ✅ **COMPLETE** - End-to-end connectivity proven and ready for feature development!