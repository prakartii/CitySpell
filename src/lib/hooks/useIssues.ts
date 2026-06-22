'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToWardIssues,
  subscribeToOpenIssues,
  subscribeToCriticalIssues,
  subscribeToUserIssues,
  subscribeToDepartmentIssues,
  subscribeToIssue,
  toggleUpvote,
  updateIssueStatus,
} from '../services/issueService';
import type { IssueDoc, IssueStatus } from '../types/collections';

// ─── Single issue ─────────────────────────────────────────────────────────────

export function useIssue(issueId: string | null) {
  const [issue, setIssue] = useState<IssueDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) {
      setIssue(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToIssue(issueId, (doc) => {
      setIssue(doc);
      setLoading(false);
    });
    return unsub;
  }, [issueId]);

  return { issue, loading };
}

// ─── Ward issues ──────────────────────────────────────────────────────────────

export function useWardIssues(wardId: string | null) {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardId) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToWardIssues(wardId, (docs) => {
      setIssues(docs);
      setLoading(false);
    });
    return unsub;
  }, [wardId]);

  return { issues, loading };
}

// ─── Open issues in a ward ────────────────────────────────────────────────────

export function useOpenIssues(wardId: string | null) {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardId) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToOpenIssues(wardId, (docs) => {
      setIssues(docs);
      setLoading(false);
    });
    return unsub;
  }, [wardId]);

  return { issues, loading };
}

// ─── Critical issues (city-wide) ──────────────────────────────────────────────

export function useCriticalIssues() {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCriticalIssues((docs) => {
      setIssues(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { issues, loading };
}

// ─── User's own issues ────────────────────────────────────────────────────────

export function useUserIssues(uid: string | null) {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToUserIssues(uid, (docs) => {
      setIssues(docs);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { issues, loading };
}

// ─── Department issues ────────────────────────────────────────────────────────

export function useDepartmentIssues(departmentId: string | null) {
  const [issues, setIssues] = useState<IssueDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToDepartmentIssues(departmentId, (docs) => {
      setIssues(docs);
      setLoading(false);
    });
    return unsub;
  }, [departmentId]);

  return { issues, loading };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function useIssueActions(uid: string | null) {
  const upvote = useCallback(
    async (issueId: string, hasVoted: boolean) => {
      if (!uid) return;
      await toggleUpvote(issueId, uid, hasVoted);
    },
    [uid],
  );

  const changeStatus = useCallback(
    async (issueId: string, status: IssueStatus, note: string) => {
      if (!uid) return;
      await updateIssueStatus(issueId, status, note, uid);
    },
    [uid],
  );

  return { upvote, changeStatus };
}
