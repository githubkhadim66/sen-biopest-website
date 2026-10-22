'use client';

import { useEffect, useState } from 'react';

export const ACTOR_LABELS: Record<string, string> = {
  PRODUCTEUR: 'Producteur',
  COOPERATIVE: 'Coopérative',
  GIE: 'GIE',
  JARDINIER: 'Jardinier',
  INSTITUTION: 'Institution',
  ENTREPRISE: 'Entreprise',
  PARTICULIER: 'Particulier',
  AUTRE: 'Autre',
};

export const PARTNER_TYPE_LABELS: Record<string, string> = {
  FOURNISSEUR: 'Fournisseur',
  DISTRIBUTEUR: 'Distributeur',
  INSTITUTION: 'Institution',
  LABORATOIRE: 'Laboratoire',
  FINANCEUR: 'Financeur',
  PROGRAMME: 'Programme',
  ACHETEUR: 'Acheteur',
  AUTRE: 'Autre',
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis',
  COMMANDE: 'Commande',
  RAPPEL: 'Rappel',
  INFORMATION: 'Information',
  ECHANTILLON: 'Échantillon',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  COMMERCIAL: 'Commercial',
  CONSEILLER: 'Conseiller technique',
};

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: { firstName: string; lastName: string };
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Waits until the user stops typing before using the value (avoids one request per keystroke) */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Downloads rows as a UTF-8 CSV that Excel opens with accents intact */
export function exportCSV(headers: string[], rows: unknown[][], filename: string) {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
