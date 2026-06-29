'use client';

import { useMemo } from 'react';
import { capabilities, type ServiceCapabilities } from '../services/capabilities';

/**
 * Returns the full capability registry.
 * Values are static (determined by env vars at build time) — the hook never re-renders due to capability changes.
 */
export function useCapabilities(): ServiceCapabilities {
  return useMemo(() => capabilities, []);
}

/**
 * Returns true if the specified capability is enabled.
 * Convenience wrapper for single-capability checks.
 */
export function useCapability(cap: keyof ServiceCapabilities): boolean {
  return capabilities[cap];
}
