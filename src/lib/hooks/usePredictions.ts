'use client';

import { useState, useEffect } from 'react';
import {
  subscribeToPrediction,
  subscribeToWardPredictions,
  subscribeToCriticalPredictions,
} from '../services/predictionService';
import type { PredictionDoc } from '../types/collections';

export function usePrediction(id: string | null) {
  const [prediction, setPrediction] = useState<PredictionDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setPrediction(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToPrediction(id, (doc) => {
      setPrediction(doc);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { prediction, loading };
}

export function useWardPredictions(wardId: string | null) {
  const [predictions, setPredictions] = useState<PredictionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wardId) {
      setPredictions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToWardPredictions(wardId, (docs) => {
      setPredictions(docs);
      setLoading(false);
    });
    return unsub;
  }, [wardId]);

  return { predictions, loading };
}

export function useCriticalPredictions() {
  const [predictions, setPredictions] = useState<PredictionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCriticalPredictions((docs) => {
      setPredictions(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { predictions, loading };
}
