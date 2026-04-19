# Smart Pocket Web - README

React web application for Smart Pocket. Provides a dashboard for managing budget and expense data with real-time synchronization to Google Sheets and Actual Budget.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Connecting to Backend](#connecting-to-backend)
- [Building & Deployment](#building--deployment)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Backend API running (see `@apps/smart-pocket-backend/README.md`)

### Installation

```bash
cd apps/smart-pocket-web
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Project Setup

1. **Create `.env` file** (optional, for backend connection):
```env
VITE_API_BASE_URL=http://localhost:3000
```

2. **Start development server**:
```bash
npm run dev
```

3. **Verify setup**:
```bash
npm run lint        # Check code quality
npm run build       # Build for production
npm test            # Run tests
```

## Architecture

### Component Structure

```
App.tsx (root component)
├── Layout Components
│   ├── Header
│   ├── Sidebar
│   └── MainContent
├── Feature Components
│   ├── Dashboard
│   ├── Transactions
│   └── Settings
└── Utility Components
    ├── Modal
    ├── Toast
    └── Loading
```

### Data Flow

```
API (Backend)
    ↓
API Client (axios)
    ↓
State Management (React hooks)
    ↓
Components (render UI)
    ↓
User Interactions → API Calls → State Updates
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build | Vite 8 | Fast bundling and dev server |
| Language | TypeScript 6 | Type-safe development |
| Framework | React 19 | UI library |
| Testing | Jest + React Testing Library | Unit & integration tests |
| Code Quality | ESLint + Prettier | Linting & formatting |
| HTTP | Axios | API communication (to add) |

### Folder Organization

```
src/
├── components/           ← Reusable React components
│   ├── common/          (buttons, inputs, cards)
│   ├── layout/          (header, sidebar, footer)
│   └── features/        (domain-specific components)
├── hooks/               ← Custom React hooks
├── services/            ← API clients and utilities
├── types/               ← TypeScript interfaces & types
├── utils/               ← Helper functions
├── __tests__/           ← Unit and integration tests
├── App.tsx              ← Root component
├── main.tsx             ← Application entry point
└── index.css            ← Global styles
```

## Development Workflow

### 1. Create a New Component

**File**: `src/components/features/MyFeature.tsx`
```typescript
import { useState } from 'react';

interface MyFeatureProps {
  title: string;
  onAction?: (data: string) => void;
}

export function MyFeature({ title, onAction }: MyFeatureProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Perform action
      onAction?.('result');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </button>
    </div>
  );
}
```

### 2. Write a Test

**File**: `src/__tests__/components/features/MyFeature.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyFeature } from '../../../components/features/MyFeature';

describe('MyFeature', () => {
  it('renders the title', () => {
    render(<MyFeature title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(<MyFeature title="Test" onAction={onAction} />);

    await user.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledWith('result');
  });

  it('shows loading state while action is pending', async () => {
    const user = userEvent.setup();
    render(<MyFeature title="Test" />);

    const button = screen.getByRole('button');
    await user.click(button);
    expect(button).toBeDisabled();
  });
});
```

### 3. Add a Custom Hook

**File**: `src/hooks/useMyFeature.ts`
```typescript
import { useState, useCallback } from 'react';

interface UseMyFeatureOptions {
  initialValue?: string;
  onError?: (error: Error) => void;
}

export function useMyFeature({ initialValue = '', onError }: UseMyFeatureOptions = {}) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch logic here
      setValue('data');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  return { value, setValue, isLoading, error, fetchData };
}
```

## Testing

### Test Organization

- Unit tests: `src/__tests__/components/` (component tests)
- Hook tests: `src/__tests__/hooks/`
- Utility tests: `src/__tests__/utils/`

### Running Tests

```bash
npm test              # Run all tests once
npm test:watch       # Run tests in watch mode
npm test:coverage    # Generate coverage report
npm test -- --no-coverage  # Run without coverage
```

### Testing Best Practices

1. **Test user behavior, not implementation**:
```typescript
// ✅ Good
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// ❌ Avoid
expect(wrapper.find('button.submit-btn')).toHaveLength(1);
```

2. **Use user-centric queries**:
```typescript
screen.getByRole('button', { name: /label/ })    // Most accessible
screen.getByLabelText(/label/)                    // Form inputs
screen.getByPlaceholderText(/placeholder/)        // Input placeholders
screen.getByText(/visible text/)                  // Text content
screen.getByTestId('id')                          // Last resort
```

3. **Simulate user interactions**:
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.selectOption(select, 'option');
```

4. **Test async behavior**:
```typescript
it('loads data on mount', async () => {
  render(<MyComponent />);
  
  // Wait for element to appear
  const element = await screen.findByText(/loading/i);
  expect(element).toBeInTheDocument();
});
```

### Mocking

**Mock API responses**:
```typescript
jest.mock('../services/api', () => ({
  fetchData: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
}));
```

**Mock custom hooks**:
```typescript
jest.mock('../hooks/useMyHook', () => ({
  useMyHook: jest.fn().mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  }),
}));
```

## Connecting to Backend

### Backend API Setup

1. **Install axios**:
```bash
npm install axios
```

2. **Create API client** (`src/services/api.ts`):
```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

3. **Create service layer** (`src/services/transactionService.ts`):
```typescript
import apiClient from './api';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const { data } = await apiClient.get('/transactions');
    return data;
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data } = await apiClient.post('/transactions', transaction);
    return data;
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const { data } = await apiClient.put(`/transactions/${id}`, transaction);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};
```

4. **Use in component**:
```typescript
import { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';

export function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await transactionService.getAll();
        setTransactions(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {transactions.map((t) => (
        <li key={t.id}>{t.description}: ${t.amount}</li>
      ))}
    </ul>
  );
}
```

### Environment Configuration

Create `.env.local` for local development:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Building & Deployment

### Production Build

```bash
npm run build
```

Output files are in `dist/` directory:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript and CSS bundles

### Preview Production Build

```bash
npm run preview
```

This runs the production build locally for testing before deployment.

### Deployment to Docker

The web app can be containerized. See `@docker/DOCKER_GUIDE.md` for setup.

**Development Dockerfile**:
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

**Production Dockerfile**:
```dockerfile
FROM node:24-alpine as builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_APP_ENV` | Environment name | `development`, `production` |

## Troubleshooting

### Dev Server Issues

**Port already in use**:
```bash
npm run dev -- --port 5174
```

**Module not found**:
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `npm install`

**Hot reload not working**:
- Check Vite config is correct
- Ensure file paths are correct in imports
- Restart dev server: `npm run dev`

### Build Errors

**TypeScript errors**:
```bash
npm run build  # Shows detailed errors
```

**Out of memory**:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Test Failures

**Tests hanging**:
- Check for unresolved promises
- Add timeouts: `jest.setTimeout(10000)`
- Clear Jest cache: `npm test -- --clearCache`

**Module not found in tests**:
- Verify jest.config.cjs `moduleNameMapper` is correct
- Check import paths match file structure

### Style Issues

**CSS not applying**:
- Ensure CSS file is imported in component
- Check CSS module naming convention (`.module.css`)
- Verify Vite CSS processing is enabled

## FAQ

**Q: How do I add a new page/route?**
A: With React Router (to add): Create component in `src/pages/`, add route in router config.

**Q: How do I manage global state?**
A: For simple state, use React Context. For complex state, consider Redux or Zustand.

**Q: How do I handle errors?**
A: Create error boundary component, use try-catch in async functions, show user-friendly messages.

**Q: Can I use CSS-in-JS (styled-components)?**
A: Yes, install and configure. Current setup uses CSS modules and inline styles.

**Q: How do I debug the app?**
A: Use React DevTools browser extension, Chrome DevTools, or add `debugger` statements.

**Q: How do I optimize performance?**
A: Use React.memo, useMemo, useCallback; lazy load components with React.lazy; analyze with React DevTools.

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vite.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/)

---

**Project**: Smart Pocket Web  
**Version**: 1.0.0  
**Last Updated**: 2026-04-19
