# Tech Stack

This table is the single source of truth for the development team.

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Monorepo Tool** | Turborepo | Latest | Manage the monorepo and orchestrate builds | Provides high-speed builds and caching with minimal configuration, ideal for hackathon velocity. |
| **Package Manager**| pnpm | 8.x | Monorepo dependency management | Extremely fast and disk-efficient, using a standard `node_modules` layout for maximum compatibility. |
| **Frontend Language**| TypeScript | 5.x | Primary language for the frontend | Ensures type safety, improves developer experience, and integrates seamlessly with Next.js. |
| **Frontend Framework**| Next.js | 14.x | React framework for the web application | Provides a production-ready, batteries-included environment with optimizations that save development time. |
| **UI Component Library**| `shadcn/ui` | Latest | Accessible and composable UI components | Aligns with the PRD and UI/UX spec, providing high-quality components that are easily styled with Tailwind CSS. |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework | Enables rapid, consistent, and responsive UI development. |
| **State Management** | Zustand | Latest | Lightweight state management | A simple, unopinionated library for managing shared client state with minimal boilerplate. |
| **Data Fetching** | TanStack Query | v5 | Asynchronous state management | The industry standard for fetching, caching, and updating server data in React, simplifying API interactions. |
| **Form Management** | React Hook Form | Latest | Performant form state management | Robust and performant way to manage our input forms, including validation. |
| **Backend Language** | TypeScript | 5.x | Primary language for the backend | Provides type safety for Lambda functions and enables shared types with the frontend. |
| **Backend Runtime** | Node.js | 20.x (LTS) | JavaScript runtime for AWS Lambda | LTS version ensures stability and performance for our serverless functions. |
| **IaC & Deploy** | AWS SAM CLI | Latest | Define and deploy serverless resources | AWS-native choice for Infrastructure as Code, simplifying the deployment of Lambda, API Gateway, and DynamoDB. |
| **API Style** | REST | v1 | API standard for client-server communication | Managed via API Gateway, it's a simple, well-understood standard for our application's needs. |
| **Database** | Amazon DynamoDB | N/A | Serverless NoSQL database | Perfectly matches our serverless architecture, offering high performance, scalability, and a pay-per-use model. |
| **GenAI Service** | AWS Bedrock | N/A | Managed Generative AI service | Provides access to the powerful Claude model without the overhead of managing infrastructure. |
| **File Storage** | Amazon S3 | N/A | Object storage for static assets | Reliable and scalable storage for assets like certification logos. |
| **Schema Validation**| Zod | Latest | TypeScript-first schema validation | Used in the backend to validate the structure of the AI's response, ensuring data integrity. |
| **Frontend Testing**| Jest & RTL | Latest | Component and unit testing | The standard, integrated testing suite for Next.js, enabling robust UI testing. |
| **E2E Testing** | Playwright | Latest | End-to-end browser automation | A modern and reliable tool for our single critical-path E2E test. |
| **CI/CD** | GitHub Actions | N/A | Automation for build, test, and deploy | A standard, powerful tool for automating our development pipeline within our code repository. |