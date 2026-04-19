/**
 * Auth Context - Type definition and context creation
 * Separated from provider for react-refresh compatibility
 */

import { createContext } from 'react';
import type { AuthContextType } from '../utils/AuthContextType';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
