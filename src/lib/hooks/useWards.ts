'use client';

import { useState, useEffect } from 'react';
import {
  subscribeToWard,
  subscribeToAllWards,
  subscribeToCriticalWards,
} from '../services/wardService';
import type { WardDoc } from '../types/collections';

export function useWard(wardId: string | null) {
  const [ward, setWard] = useState<WardDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardId) {
      setWard(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToWard(wardId, (doc) => {
      setWard(doc);
      setLoading(false);
    });
    return unsub;
  }, [wardId]);

  return { ward, loading };
}

export function useAllWards(city: string) {
  const [wards, setWards] = useState<WardDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    const unsub = subscribeToAllWards(city, (docs) => {
      setWards(docs);
      setLoading(false);
    });
    return unsub;
  }, [city]);

  return { wards, loading };
}

export function useCriticalWards() {
  const [wards, setWards] = useState<WardDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCriticalWards((docs) => {
      setWards(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { wards, loading };
}
