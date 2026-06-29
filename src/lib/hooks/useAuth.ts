'use client';

// Re-export from AuthContext so callers that import from the hook path still work.
export { useAuthContext as useAuth } from '../context/AuthContext';
export type { SignUpPayload } from '../context/AuthContext';
