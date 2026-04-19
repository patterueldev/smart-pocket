# Smart Pocket Web - AGENTS.md

Quick reference guide for AI agents and developers working on the React web application.

## 📍 Quick Start

**Setup**:
```bash
cd apps/smart-pocket-web
npm install
npm run dev
```

**Verify Installation**:
```bash
npm run lint         # Check for linting errors
npm run build        # Compile TypeScript and bundle
npm test             # Run tests
```

**Available Commands**:
- `npm run dev` - Start dev server (hot reload at http://localhost:5173)
- `npm run build` - Production build
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting
- `npm test` - Run Jest tests
- `npm test:watch` - Watch mode for tests
- `npm test:coverage` - Generate coverage report
- `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
apps/smart-pocket-web/
├── src/
│   ├── __tests__/          ← Unit tests
│   ├── App.tsx             ← Root component
│   ├── main.tsx            ← Application entry point
│   ├── index.css           ← Global styles
│   └── vite-env.d.ts       ← Vite type definitions
├── public/                 ← Static assets
├── dist/                   ← Production build output
├── .eslintrc.json          ← Linting configuration
├── .prettierrc              ← Code formatting configuration
├── jest.config.cjs         ← Jest testing configuration
├── vite.config.ts          ← Vite bundler configuration
├── tsconfig.json           ← TypeScript configuration
├── package.json            ← Dependencies and scripts
└── README.md               ← Comprehensive documentation
```

## 🔧 Tech Stack

- **Framework**: React 19 with TypeScript
- **Bundler**: Vite 8 (fast development builds)
- **Linting**: ESLint + Prettier (consistent code style)
- **Testing**: Jest + React Testing Library
- **Language**: TypeScript (strict mode enabled)

## 🎯 Common Tasks

### Add a New Component

1. Create file in `src/` (e.g., `src/components/MyComponent.tsx`):
```typescript
interface MyComponentProps {
  title: string;
  count?: number;
}

export function MyComponent({ title, count = 0 }: MyComponentProps) {
  return <div>{title}: {count}</div>;
}
```

2. Export from `src/components/index.ts` (if using barrel exports)
3. Import and use in another component
4. Add test in `src/__tests__/MyComponent.test.tsx`

### Write a Test

1. Create file in `src/__tests__/YourComponent.test.tsx`
2. Use React Testing Library patterns:
```typescript
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders text', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

3. Run `npm test` to verify

### Connect to Backend API

See `README.md` section "Connecting to Backend" for setup instructions and examples.

### Fix Linting Errors

```bash
npm run lint:fix       # Auto-fix issues ESLint can handle
npm run format         # Format code with Prettier
```

## ✅ Code Quality Standards

**TypeScript**:
- Strict mode enabled (`strict: true`)
- All functions must have return types
- No `any` types without justification
- All variables properly typed

**Linting**:
All code must pass ESLint:
```bash
npm run lint           # Must show 0 errors
npm run format:check   # Must show 0 formatting issues
```

**Testing**:
- New components should have tests
- Tests use React Testing Library (user-centric)
- Run: `npm test`
- Coverage threshold: 50% global

## 🚨 Troubleshooting

**Dev server won't start**:
- Ensure Node.js version 18+
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try a different port: `npm run dev -- --port 5174`

**Tests failing**:
- Run `npm test` to see error details
- Check test file has correct imports
- Verify component renders properly in isolation
- Clear Jest cache: `npm test -- --clearCache`

**TypeScript errors**:
- Check tsconfig.json strict mode is enabled
- Ensure all function parameters have types
- Verify return types on all functions
- Run `npm run build` to validate

**Prettier conflicts with ESLint**:
- Run `npm run format` to format code
- Run `npm run lint:fix` to fix linting
- Prettier config overrides ESLint's formatting rules

## 📚 For Detailed Information

See **README.md** for:
- Architecture overview
- Backend API integration guide
- Component patterns and best practices
- State management strategies
- Deployment instructions
- FAQs and advanced topics

## 🔗 Related Guides

- Backend API: `@apps/smart-pocket-backend/AGENTS.md`
- Mobile App: `@apps/smart-pocket-mobile/AGENTS.md`
- Docker Setup: `@infrastructure/docker/DOCKER_GUIDE.md`
- Project Overview: `@AGENTS.md`

---

**Status**: ✅ Complete  
**Last Updated**: 2026-04-19
