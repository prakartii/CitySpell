'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToCopilotReport,
  subscribeToLatestReports,
  subscribeToWardReports,
  markReportRead,
} from '../services/copilotReportService';
import type { CopilotReportDoc } from '../types/collections';

export function useCopilotReport(id: string | null) {
  const [report, setReport] = useState<CopilotReportDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setReport(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToCopilotReport(id, (doc) => {
      setReport(doc);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { report, loading };
}

export function useLatestReports(pageLimit = 20) {
  const [reports, setReports] = useState<CopilotReportDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLatestReports((docs) => {
      setReports(docs);
      setLoading(false);
    }, pageLimit);
    return unsub;
  }, [pageLimit]);

  return { reports, loading };
}

export function useWardReports(wardId: string | null) {
  const [reports, setReports] = useState<CopilotReportDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardId) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToWardReports(wardId, (docs) => {
      setReports(docs);
      setLoading(false);
    });
    return unsub;
  }, [wardId]);

  const markRead = useCallback(
    async (reportId: string, uid: string) => {
      await markReportRead(reportId, uid);
    },
    [],
  );

  return { reports, loading, markRead };
}
