'use client';

import { useState, useEffect } from 'react';
import {
  subscribeToAssignment,
  subscribeToIssueAssignments,
  subscribeToDepartmentAssignments,
} from '../services/assignmentService';
import type { AssignmentDoc } from '../types/collections';

export function useAssignment(id: string | null) {
  const [assignment, setAssignment] = useState<AssignmentDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setAssignment(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToAssignment(id, (doc) => {
      setAssignment(doc);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { assignment, loading };
}

export function useIssueAssignments(issueId: string | null) {
  const [assignments, setAssignments] = useState<AssignmentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToIssueAssignments(issueId, (docs) => {
      setAssignments(docs);
      setLoading(false);
    });
    return unsub;
  }, [issueId]);

  return { assignments, loading };
}

export function useDepartmentAssignments(departmentId: string | null) {
  const [assignments, setAssignments] = useState<AssignmentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToDepartmentAssignments(departmentId, (docs) => {
      setAssignments(docs);
      setLoading(false);
    });
    return unsub;
  }, [departmentId]);

  return { assignments, loading };
}
