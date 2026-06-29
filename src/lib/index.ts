// Firebase core
export * from './firebase/config';
export * from './firebase/auth';
export * from './firebase/storage';
export * from './firebase/demo';
export { COLLECTIONS } from './firebase/firestore';

// Types
export * from './types/collections';

// Services
export * from './services/userService';
export * from './services/issueService';
export * from './services/wardService';
export * from './services/predictionService';
export * from './services/departmentService';
export * from './services/assignmentService';
export * from './services/copilotReportService';

// Hooks (client-only — 'use client' in each file)
export * from './hooks/useAuth';
export * from './hooks/useIssues';
export * from './hooks/useWards';
export * from './hooks/usePredictions';
export * from './hooks/useDepartments';
export * from './hooks/useAssignments';
export * from './hooks/useCopilotReports';

// Context
export { AuthProvider, useAuthContext } from './context/AuthContext';
export { ToastProvider, useToast } from './context/ToastContext';
