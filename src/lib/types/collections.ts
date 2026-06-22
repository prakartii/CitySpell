import type { Timestamp } from 'firebase/firestore';

// ─── Shared ───────────────────────────────────────────────────────────────────

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';
export type IssueCategory =
  | 'pothole'
  | 'streetlight'
  | 'garbage'
  | 'water'
  | 'sewage'
  | 'park'
  | 'road'
  | 'building'
  | 'other';

export type UserRole = 'citizen' | 'authority' | 'admin';
export type AssignmentStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'escalated';
export type PredictionType =
  | 'infrastructure_failure'
  | 'water_shortage'
  | 'power_outage'
  | 'flooding'
  | 'road_damage';
export type PredictionStatus = 'active' | 'prevented' | 'occurred' | 'expired';
export type ReportType =
  | 'daily_summary'
  | 'ward_health'
  | 'prediction_alert'
  | 'economic_impact'
  | 'department_performance';

// ─── GeoLocation ──────────────────────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  wardId: string;
  wardName: string;
}

// ─── users ────────────────────────────────────────────────────────────────────

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  wardId: string;
  phone?: string;
  avatarUrl?: string;
  departmentId?: string; // authority users only
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  stats: {
    issuesReported: number;
    issuesResolved: number;
    reputationScore: number;
  };
}

export type UserCreateInput = Omit<UserDoc, 'createdAt' | 'updatedAt'>;
export type UserUpdateInput = Partial<
  Omit<UserDoc, 'uid' | 'createdAt' | 'updatedAt'>
>;

// ─── issues ───────────────────────────────────────────────────────────────────

export interface AIBoundingBox {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIAnalysis {
  confidence: number;
  detectedCategory: IssueCategory;
  severity: IssueSeverity;
  estimatedCost: number;
  priority: number; // 1–10
  boundingBoxes: AIBoundingBox[];
  processedAt: Timestamp;
}

export interface IssueTimeline {
  status: IssueStatus | string;
  note: string;
  updatedBy: string; // uid
  timestamp: Timestamp;
}

export interface IssueDoc {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  location: GeoLocation;
  reportedBy: string; // uid
  reportedAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  images: string[]; // Storage download URLs
  aiAnalysis: AIAnalysis;
  assignedTo?: string; // departmentId
  assignedAt?: Timestamp;
  upvotes: number;
  upvotedBy: string[]; // uids
  commentsCount: number;
  economicImpact: {
    estimatedLossINR: number;
    affectedResidents: number;
  };
  timeline: IssueTimeline[];
  tags: string[];
}

export type IssueCreateInput = Omit<
  IssueDoc,
  'id' | 'reportedAt' | 'updatedAt' | 'upvotes' | 'upvotedBy' | 'commentsCount' | 'timeline'
>;
export type IssueUpdateInput = Partial<
  Omit<IssueDoc, 'id' | 'reportedAt' | 'reportedBy'>
>;

// ─── wards ────────────────────────────────────────────────────────────────────

export interface WardCouncilor {
  name: string;
  phone: string;
  email: string;
}

export interface WardCategoryStats {
  [category: string]: number;
}

export interface WardDoc {
  id: string;
  name: string;
  wardNumber: number;
  city: string;
  state: string;
  boundaries?: Record<string, unknown>; // GeoJSON polygon (optional)
  population: number;
  areaKm2: number;
  councilor: WardCouncilor;
  healthScore: number; // 0–100
  healthTrend: 'improving' | 'stable' | 'declining';
  stats: {
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    avgResolutionTimeDays: number;
    citizenSatisfaction: number; // 0–100
  };
  categoryBreakdown: WardCategoryStats;
  updatedAt: Timestamp;
}

export type WardUpdateInput = Partial<Omit<WardDoc, 'id'>>;

// ─── predictions ──────────────────────────────────────────────────────────────

export interface PredictionDoc {
  id: string;
  wardId: string;
  type: PredictionType;
  title: string;
  description: string;
  probability: number; // 0–1
  severity: IssueSeverity;
  predictedAt: Timestamp;
  expectedOccurrence: Timestamp;
  location: Omit<GeoLocation, 'wardName'> & { wardName?: string };
  preventiveCostINR: number;
  reactiveCostINR: number;
  confidence: number; // 0–1
  modelVersion: string;
  inputFeatures: Record<string, number | string>;
  status: PredictionStatus;
  relatedIssueIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PredictionCreateInput = Omit<
  PredictionDoc,
  'id' | 'createdAt' | 'updatedAt'
>;
export type PredictionUpdateInput = Partial<
  Omit<PredictionDoc, 'id' | 'createdAt'>
>;

// ─── departments ──────────────────────────────────────────────────────────────

export interface DepartmentBudget {
  allocatedINR: number;
  spentINR: number;
}

export interface DepartmentHead {
  name: string;
  email: string;
  phone: string;
}

export interface DepartmentDoc {
  id: string;
  name: string;
  code: string; // short code, e.g. "PWD", "BWSSB"
  city: string;
  handledCategories: IssueCategory[];
  head: DepartmentHead;
  staffCount: number;
  activeIssues: number;
  resolvedThisMonth: number;
  avgResolutionTimeDays: number;
  performanceScore: number; // 0–100
  budget: DepartmentBudget;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DepartmentCreateInput = Omit<
  DepartmentDoc,
  'id' | 'createdAt' | 'updatedAt'
>;
export type DepartmentUpdateInput = Partial<
  Omit<DepartmentDoc, 'id' | 'createdAt'>
>;

// ─── assignments ──────────────────────────────────────────────────────────────

export interface AssignmentUpdate {
  status: AssignmentStatus | string;
  note: string;
  by: string; // uid
  at: Timestamp;
}

export interface AssignmentFeedback {
  rating: number; // 1–5
  comment: string;
  submittedAt: Timestamp;
}

export interface AssignmentDoc {
  id: string;
  issueId: string;
  departmentId: string;
  assignedBy: string; // uid (authority)
  assignedAt: Timestamp;
  dueDate: Timestamp;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: AssignmentStatus;
  notes: string;
  officerName?: string;
  officerUid?: string;
  updates: AssignmentUpdate[];
  completedAt?: Timestamp;
  feedback?: AssignmentFeedback;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AssignmentCreateInput = Omit<
  AssignmentDoc,
  'id' | 'createdAt' | 'updatedAt' | 'updates'
>;
export type AssignmentUpdateInput = Partial<
  Omit<AssignmentDoc, 'id' | 'createdAt'>
>;

// ─── copilot_reports ──────────────────────────────────────────────────────────

export interface CopilotReportDoc {
  id: string;
  type: ReportType;
  wardId?: string;
  departmentId?: string;
  title: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  data: Record<string, unknown>;
  generatedAt: Timestamp;
  generatedBy: 'system' | string; // 'system' or uid
  status: 'draft' | 'published' | 'archived';
  readBy: string[]; // uids
  priority: 'high' | 'normal' | 'low';
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export type CopilotReportCreateInput = Omit<
  CopilotReportDoc,
  'id' | 'createdAt' | 'readBy'
>;
export type CopilotReportUpdateInput = Partial<
  Omit<CopilotReportDoc, 'id' | 'createdAt'>
>;

// ─── Realtime subscription callbacks ─────────────────────────────────────────

export type UnsubscribeFn = () => void;
export type CollectionCallback<T> = (docs: T[]) => void;
export type DocCallback<T> = (doc: T | null) => void;
