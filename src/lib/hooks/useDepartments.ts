'use client';

import { useState, useEffect } from 'react';
import {
  subscribeToDepartment,
  subscribeToAllDepartments,
} from '../services/departmentService';
import type { DepartmentDoc } from '../types/collections';

export function useDepartment(id: string | null) {
  const [department, setDepartment] = useState<DepartmentDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setDepartment(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToDepartment(id, (doc) => {
      setDepartment(doc);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { department, loading };
}

export function useAllDepartments(city: string) {
  const [departments, setDepartments] = useState<DepartmentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    const unsub = subscribeToAllDepartments(city, (docs) => {
      setDepartments(docs);
      setLoading(false);
    });
    return unsub;
  }, [city]);

  return { departments, loading };
}
