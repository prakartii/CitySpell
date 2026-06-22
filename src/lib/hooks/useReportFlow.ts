'use client';

import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { uploadIssueImages } from '../firebase/storage';
import { createIssue } from '../services/issueService';
import { captureGPS, reverseGeocode, type ResolvedLocation } from '../services/geocodingService';
import { getCurrentUser } from '../firebase/auth';
import type { IssueCategory, IssueSeverity } from '../types/collections';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface AnalysisResult {
  issueId: string;
  // Gemini output
  category: IssueCategory;
  type: string;
  title: string;
  confidence: number;       // 0-100
  severity: IssueSeverity;
  severityScore: number;    // 0-100
  riskScore: number;        // 0-100
  subcategory: string;
  description: string;
  tags: string[];
  dept: string;
  action: string;
  urgency: string;
  // Economic
  estimatedDailyCostINR: number;
  economic: string;         // "₹52K"
  period: string;           // "per day"
  affected: number;
  // Location
  location: string;
  geoLocation: ResolvedLocation;
  // Media
  imageUrl: string;         // Firebase Storage URL or object URL
  // Timing
  elapsedMs: number;
}

/** Maps to the 6 steps shown in AnalyzingStage (0-indexed). */
export type AnalyzeStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReportFlowHook {
  /** Current step (0-5) while analyzing; null when idle or done. */
  activeStep: AnalyzeStep | null;
  result: AnalysisResult | null;
  error: string | null;
  startFlow: (file: File) => Promise<void>;
  reset: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${Math.round(amount / 1_000)}K`;
  return `₹${amount}`;
}

/** Resize image client-side to ≤ 1024 px on longest edge, JPEG 0.8. */
function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Return base64 without the data:image/jpeg;base64, prefix
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
    img.src = URL.createObjectURL(file);
  });
}

const FALLBACK_LOCATION: ResolvedLocation = {
  lat: 12.9716,
  lng: 77.5946,
  address: 'Bengaluru, Karnataka',
  wardId: 'BLR_general',
  wardName: 'General Ward',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReportFlow(): ReportFlowHook {
  const [activeStep, setActiveStep] = useState<AnalyzeStep | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startFlow = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    const startTime = Date.now();

    try {
      // ── Step 0: Process image ────────────────────────────────────────────
      setActiveStep(0);
      const base64 = await resizeToBase64(file);

      // ── Step 1: GPS capture (best-effort, runs fast) ─────────────────────
      setActiveStep(1);
      let coords: { lat: number; lng: number } | null = null;
      try {
        coords = await Promise.race([
          captureGPS(),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5_000)),
        ]);
      } catch {
        // GPS is optional — proceed with fallback location
      }

      // ── Step 2: Gemini Vision analysis ──────────────────────────────────
      setActiveStep(2);
      const geminiRes = await fetch('/api/report/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType: 'image/jpeg' }),
      });
      if (!geminiRes.ok) throw new Error('AI analysis failed — please try again.');
      const gemini = await geminiRes.json() as {
        category: IssueCategory;
        type: string;
        title: string;
        confidence: number;
        severity: IssueSeverity;
        severityScore: number;
        riskScore: number;
        subcategory: string;
        description: string;
        tags: string[];
        dept: string;
        action: string;
        urgency: string;
        affectedResidents: number;
        estimatedDailyCostINR: number;
      };

      // ── Step 3: Economic impact ──────────────────────────────────────────
      setActiveStep(3);
      const estimatedDailyCostINR = gemini.estimatedDailyCostINR;
      const economic = formatINR(estimatedDailyCostINR);

      // ── Step 4: Reverse geocode ──────────────────────────────────────────
      setActiveStep(4);
      let geoLocation: ResolvedLocation | null = null;
      if (coords) {
        try {
          geoLocation = await reverseGeocode(coords.lat, coords.lng);
        } catch {
          geoLocation = { ...FALLBACK_LOCATION, lat: coords.lat, lng: coords.lng };
        }
      }
      const resolvedLocation: ResolvedLocation = geoLocation ?? FALLBACK_LOCATION;

      // ── Step 5: Upload image + save to Firestore ─────────────────────────
      setActiveStep(5);
      const user = getCurrentUser();
      const tempId = `issue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      let imageUrl = '';
      try {
        const urls = await uploadIssueImages(tempId, [file]);
        imageUrl = urls[0] ?? '';
      } catch {
        // Proceed without image — auth may not be set up yet
        imageUrl = URL.createObjectURL(file); // in-memory preview fallback
      }

      const issueId = await createIssue({
        title: gemini.title,
        description: gemini.description,
        category: gemini.category,
        severity: gemini.severity,
        status: 'open',
        location: resolvedLocation,
        reportedBy: user?.uid ?? 'anonymous',
        images: imageUrl && !imageUrl.startsWith('blob:') ? [imageUrl] : [],
        aiAnalysis: {
          confidence: gemini.confidence / 100,
          detectedCategory: gemini.category,
          severity: gemini.severity,
          estimatedCost: estimatedDailyCostINR,
          priority: gemini.severityScore > 75 ? 9 : gemini.severityScore > 50 ? 6 : 3,
          boundingBoxes: [],
          processedAt: Timestamp.now(),
        },
        economicImpact: {
          estimatedLossINR: estimatedDailyCostINR,
          affectedResidents: gemini.affectedResidents,
        },
        tags: gemini.tags,
      });

      setActiveStep(null);
      setResult({
        issueId,
        category: gemini.category,
        type: gemini.type,
        title: gemini.title,
        confidence: gemini.confidence,
        severity: gemini.severity,
        severityScore: gemini.severityScore,
        riskScore: gemini.riskScore,
        subcategory: gemini.subcategory,
        description: gemini.description,
        tags: gemini.tags,
        dept: gemini.dept,
        action: gemini.action,
        urgency: gemini.urgency,
        estimatedDailyCostINR,
        economic,
        period: 'per day',
        affected: gemini.affectedResidents,
        location: resolvedLocation.address,
        geoLocation: resolvedLocation,
        imageUrl,
        elapsedMs: Date.now() - startTime,
      });
    } catch (err) {
      setActiveStep(null);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }, []);

  const reset = useCallback(() => {
    setActiveStep(null);
    setResult(null);
    setError(null);
  }, []);

  return { activeStep, result, error, startFlow, reset };
}
