# Codexa - AI-Powered Code Generation & Management Platform

A sophisticated full-stack application that leverages AI to help developers generate, edit, and manage code projects with intelligent assistance. Codexa combines modern web technologies with advanced AI capabilities to streamline your development workflow.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Error Tracking](#error-tracking)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Codexa is a comprehensive platform designed for developers who want to leverage AI to accelerate their coding workflow. Whether you're generating boilerplate code, refactoring existing projects, or exploring architectural patterns, Codexa provides intelligent assistance through an intuitive conversational interface.

The platform supports multiple programming languages, integrates with GitHub, and provides real-time code execution through WebContainer technology.

## ✨ Features

### Core Features
- **🤖 AI-Powered Code Generation** - Generate code snippets and complete files using advanced language models
- **💬 Conversational AI Interface** - Natural language interactions for code generation and modification
- **📁 Project Management** - Organize and manage multiple projects with hierarchical file structures
- **🔄 GitHub Integration** - Import projects from GitHub and export changes back to repositories
- **🚀 Real-Time Code Execution** - Run and test code directly in the browser using WebContainer
- **🎨 Rich Code Editor** - Multi-language syntax highlighting with CodeMirror
- **📊 UML Visualization** - Generate and visualize UML diagrams from code
- **🌐 Multi-Language Support** - Support for JavaScript, TypeScript, Python, Java, C++, Go, Rust, SQL, CSS, HTML, YAML, Markdown, and more
- **💾 File Management** - Create, edit, and organize files and folders within projects
- **🔒 Secure Authentication** - User authentication powered by Clerk

### Advanced Features
- **🧠 AI Agent Architecture** - Powered by Inngest for reliable background processing
- **📡 Web Preview** - Real-time preview of web applications
- **🎯 Code Suggestions** - Intelligent code suggestions and quick-edits
- **📝 Message Threading** - Maintain conversation history for each project
- **🎭 Persona Selection** - Choose different AI personas for varied coding styles
- **📤 Export to GitHub** - Seamless integration with GitHub for version control
- **⚙️ Project Settings** - Configure installation and development commands per project

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://react.dev/) - JavaScript library for building user interfaces
- **Styling**: 
  - [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
  - [shadcn/ui](https://ui.shadcn.com/) - High-quality React components
  - [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- **Code Editor**: [CodeMirror 6](https://codemirror.net/) - Powerful browser-based code editor
- **Visualization**:
  - [Mermaid](https://mermaid.js.org/) - Diagram and visualization library
  - [XYFlow](https://xyflow.com/) - Node-based UI library
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [TanStack React Form](https://tanstack.com/form/)
- **Terminal**: [xterm.js](https://xtermjs.org/) - Terminal emulator for the web
- **Code Execution**: [WebContainer API](https://webcontainer.io/) - Run Node.js in the browser
- **Charting**: [Recharts](https://recharts.org/) - React component charting library
- **Markdown**: [React Markdown](https://github.com/remarkjs/react-markdown) + [Shiki](https://shiki.matsu.io/) for syntax highlighting
- **Animation**: [Motion](https://motion.dev/) - Animation library
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- **HTTP Client**: [Ky](https://github.com/sindresorhus/ky) - Tiny HTTP client
- **UI Utilities**:
  - [Lucide React](https://lucide.dev/) - Beautiful icon library
  - [Embla Carousel](https://www.emblacarousel.com/) - Carousel component
  - [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
  - [Vaul](https://vaul.emilkowal.ski/) - Drawer component

### Backend
- **Database**: [Convex](https://www.convex.dev/) - Real-time backend as a service
- **AI Integration**:
  - [Vercel AI SDK](https://sdk.vercel.ai/) - Unified AI interface
  - [Google Generative AI](https://ai.google.dev/)
  - [Groq API](https://console.groq.com/)
- **Job Queue**: [Inngest](https://www.inngest.com/) - Serverless job scheduling
- **Web Scraping**: [Firecrawl](https://www.firecrawl.dev/) - Web scraping and crawling
- **Authentication**: [Clerk](https://clerk.com/) - User authentication and management
- **GitHub Integration**: [Octokit](https://octokit.github.io/) - GitHub API client

### DevOps & Monitoring
- **Error Tracking**: [Sentry](https://sentry.io/) - Error monitoring and performance tracking
- **Linting**: [ESLint](https://eslint.org/) - JavaScript linter
- **Type Checking**: [TypeScript](https://www.typescriptlang.org/) - Static type checking for JavaScript
- **Build Tool**: [Webpack](https://webpack.js.org/) - Module bundler (via Next.js)

## 📂 Project Structure

```
codexa/
├── convex/                          # Backend database & functions
│   ├── auth.ts                      # Authentication logic
│   ├── conversations.ts             # Conversation management
│   ├── messages.ts                  # Message handling
│   ├── projects.ts                  # Project CRUD operations
│   ├── files.ts                     # File management
│   ├── schema.ts                    # Convex data schema
│   ├── system.ts                    # System utilities
│   └── _generated/                  # Auto-generated API files
├── src/
│   ├── app/
│   │   ├── api/                     # Next.js API routes
│   │   │   ├── generate-uml/        # UML generation endpoint
│   │   │   ├── github/              # GitHub integration
│   │   │   ├── inngest/             # Inngest webhook
│   │   │   ├── messages/            # Message endpoints
│   │   │   ├── projects/            # Project endpoints
│   │   │   ├── quick-edit/          # Quick edit functionality
│   │   │   └── suggestion/          # Code suggestions
│   │   ├── projects/                # Project pages
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── ai-elements/             # AI-related UI components
│   │   │   ├── agent.tsx            # AI agent component
│   │   │   ├── artifact.tsx         # Generated artifacts
│   │   │   ├── code-block.tsx       # Code display component
│   │   │   ├── message.tsx          # Chat messages
│   │   │   ├── prompt-input.tsx     # User input component
│   │   │   ├── sandbox.tsx          # Code execution sandbox
│   │   │   ├── terminal.tsx         # Terminal emulator
│   │   │   ├── file-tree.tsx        # File browser
│   │   │   ├── canvas.tsx           # Drawing/diagramming canvas
│   │   │   └── [other components]   # Many more specialized components
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── [other components]   # shadcn/ui components
│   │   └── uml/                     # UML visualization components
│   ├── features/
│   │   ├── auth/                    # Authentication features
│   │   ├── conversations/           # Conversation management
│   │   ├── editor/                  # Code editor features
│   │   ├── preview/                 # Preview functionality
│   │   └── projects/                # Project management
│   ├── hooks/                       # Custom React hooks
│   ├── inngest/                     # Inngest job definitions
│   ├── lib/
│   │   ├── convex-client.ts         # Convex client setup
│   │   ├── firecrawl.ts             # Firecrawl integration
│   │   ├── utils.ts                 # Utility functions
│   │   └── uml/                     # UML generation utilities
│   ├── instrumentation.ts           # Server-side monitoring
│   └── instrumentation-client.ts    # Client-side monitoring
├── public/                          # Static assets
├── .next/                           # Next.js build output (generated)
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind configuration
├── next.config.ts                   # Next.js configuration
├── eslint.config.mjs                # ESLint configuration
└── postcss.config.mjs               # PostCSS configuration
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm/bun)
- **Git** for version control

### Required Accounts/API Keys

1. **Clerk** - Authentication platform
   - Create account at [clerk.com](https://clerk.com/)
   - Get publishable and secret keys

2. **Convex** - Backend database
   - Create project at [convex.dev](https://www.convex.dev/)
   - Get deployment URL

3. **AI Services** (choose at least one):
   - **Google Gemini API** - Get API key from [ai.google.dev](https://ai.google.dev/)
   - **Groq API** - Get API key from [console.groq.com](https://console.groq.com/)

4. **GitHub** (optional, for GitHub integration)
   - OAuth app for GitHub integration
   - Personal access token for API access

5. **Inngest** (optional, for background jobs)
   - Create project at [inngest.com](https://www.inngest.com/)

6. **Sentry** (optional, for error tracking)
   - Create project at [sentry.io](https://sentry.io/)
   - Get DSN

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codexa.git
cd codexa
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key

# Inngest (optional)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key

# GitHub Integration (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_TOKEN=your_github_personal_token

# Sentry (optional)
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) to see the application

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build the production application
npm start                # Start the production server

# Code Quality
npm run lint             # Run ESLint to check code quality

# Type Checking (if added to scripts)
npm run type-check       # Type check TypeScript files
```

### Script Details

- **dev**: Runs the Next.js development server with automatic code reloading
- **build**: Compiles the Next.js app for production
- **start**: Runs the production server (requires build first)
- **lint**: Runs ESLint and reports code quality issues

## ⚙️ Configuration

### Next.js Configuration (`next.config.ts`)

The application includes:
- Sentry integration for error tracking
- CORS headers configuration for cross-origin requests
- Webpack optimization for browser features

### TypeScript Configuration (`tsconfig.json`)

- Strict mode enabled
- Path aliases configured (e.g., `@/` for `src/` imports)
- Support for latest ECMAScript features

### Tailwind Configuration (`tailwind.config.ts`)

- Custom color schemes
- Animation utilities
- Theme customization

### ESLint Configuration (`eslint.config.mjs`)

- Next.js recommended rules
- React best practices
- TypeScript type checking

## 🔐 Environment Variables

### Authentication
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for authentication |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth |

### Backend
| Variable | Purpose |
|----------|---------|
| `CONVEX_DEPLOYMENT` | Convex deployment identifier |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex URL for client-side queries |

### AI Services
| Variable | Purpose |
|----------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key |
| `GROQ_API_KEY` | Groq API key for fast LLM inference |

### Integrations
| Variable | Purpose |
|----------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `GITHUB_TOKEN` | GitHub personal access token |

### Monitoring
| Variable | Purpose |
|----------|---------|
| `SENTRY_AUTH_TOKEN` | Sentry authentication token |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing key |
| `INNGEST_EVENT_KEY` | Inngest event publishing key |

## 🔌 API Routes

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[projectId]` - Get specific project
- `PUT /api/projects/[projectId]` - Update project
- `DELETE /api/projects/[projectId]` - Delete project

### Messages
- `GET /api/messages` - Get conversation messages
- `POST /api/messages` - Send new message

### Code Generation
- `POST /api/generate-uml` - Generate UML diagrams from code
- `POST /api/suggestion` - Get code suggestions
- `POST /api/quick-edit` - Quick code editing

### GitHub
- `POST /api/github/import` - Import project from GitHub
- `POST /api/github/export` - Export changes to GitHub

### Webhooks
- `POST /api/inngest` - Inngest webhook for background jobs

## 📊 Database Schema

### Projects Table
```typescript
{
  name: string                  // Project name
  ownerId: string              // Owner user ID
  updatedAt: number            // Last update timestamp
  importStatus?: "importing" | "completed" | "failed"
  exportStatus?: "exporting" | "completed" | "failed" | "cancelled"
  exportRepoUrl?: string       // GitHub export URL
  settings?: {
    installCommand?: string    // npm install equivalent
    devCommand?: string        // Development server command
  }
}
```

### Files Table
```typescript
{
  projectId: Id<"projects">    // Parent project
  parentId?: Id<"files">       // Parent folder (for hierarchy)
  name: string                 // File/folder name
  type: "file" | "folder"      // Item type
  content?: string             // File content (for text files)
  storageId?: Id<"_storage">   // Convex storage ID (for binary files)
  updatedAt: number            // Last modification time
}
```

### Conversations Table
```typescript
{
  projectId: Id<"projects">    // Associated project
  title: string                // Conversation title
  updatedAt: number            // Last message timestamp
}
```

### Messages Table
```typescript
{
  conversationId: Id<"conversations">  // Parent conversation
  projectId: Id<"projects">            // Project context
  role: "user" | "assistant"           // Message sender role
  content: string                      // Message content
  status?: "processing" | "completed" | "cancelled"
}
```

## 🔐 Authentication

The application uses **Clerk** for authentication:

1. Users sign up/login through Clerk
2. Clerk provides authentication tokens
3. Tokens are used to secure API routes and Convex queries
4. User information is available throughout the app via Clerk hooks

### Protected Routes

- All `/api/*` routes require authentication
- Convex queries validate user identity server-side
- User-specific data is filtered by `ownerId`

## 📈 Error Tracking

### Sentry Integration

- **Server-side errors** tracked automatically
- **Client-side errors** captured and reported
- **Performance monitoring** enabled
- **Tunnel route** at `/monitoring` for bypassing ad-blockers

### Instrumentation

- `src/instrumentation.ts` - Server-side setup
- `src/instrumentation-client.ts` - Client-side setup

## 💡 Development Guidelines

### Code Organization

1. **Components**: Place reusable UI components in `src/components/`
2. **Features**: Feature-specific logic goes in `src/features/`
3. **Hooks**: Custom hooks in `src/hooks/`
4. **Utils**: Utility functions in `src/lib/`
5. **Types**: TypeScript types alongside their usage

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: kebab-case for utilities (e.g., `user-utils.ts`)
- **Functions**: camelCase (e.g., `getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Best Practices

1. **Type Safety**: Use TypeScript for all code
2. **Component Props**: Define interfaces for all component props
3. **Error Handling**: Always handle errors gracefully
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Follow WCAG guidelines with Radix UI
6. **Testing**: Add tests for critical functions

### Performance Optimization

- Use `next/image` for images
- Implement lazy loading for components
- Optimize bundle size with code splitting
- Cache queries with Convex
- Use memoization for expensive computations

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel project settings
   - Add all `.env.local` variables

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

### Docker Deployment

```dockerfile
# Use Node.js base image
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment for Production

```env
# Set to production
NODE_ENV=production

# Use production database URLs
CONVEX_DEPLOYMENT=prod-deployment-url
NEXT_PUBLIC_CONVEX_URL=prod-convex-url

# Ensure all secrets are set
CLERK_SECRET_KEY=your_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_key
# ... other secrets
```

## 👥 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Guidelines

- Follow the code organization structure
- Write descriptive commit messages
- Ensure TypeScript types are properly defined
- Run `npm run lint` before committing
- Update documentation for significant changes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, issues, or questions:

- Open an issue on GitHub
- Check existing documentation
- Review component storybooks if available

---

For the latest updates and announcements, follow the project repository.
