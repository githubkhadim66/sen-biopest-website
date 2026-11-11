import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-SN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatPhone(phone: string) {
  return phone.replace(/(\+221)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

export function getWhatsAppUrl(number: string, message?: string) {
  const clean = number.replace(/[^0-9+]/g, '');
  const encoded = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${clean.replace('+', '')}${encoded ? `?text=${encoded}` : ''}`;
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+221770000000';

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOUVEAU: 'Nouveau',
    EN_COURS: 'En cours',
    RELANCE: 'Relancé',
    CONVERTI: 'Converti',
    ANNULE: 'Annulé',
    TRAITE: 'Traité',
    CLOTURE: 'Clôturé',
    INSCRIT: 'Inscrit',
    CONFIRME: 'Confirmé',
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    QUALIFIE: 'Qualifié',
    EN_DISCUSSION: 'En discussion',
    ACCEPTE: 'Accepté',
    REFUSE: 'Refusé',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    NOUVEAU: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-yellow-100 text-yellow-800',
    RELANCE: 'bg-orange-100 text-orange-800',
    CONVERTI: 'bg-green-100 text-green-800',
    ANNULE: 'bg-red-100 text-red-800',
    TRAITE: 'bg-green-100 text-green-800',
    CLOTURE: 'bg-gray-100 text-gray-800',
    INSCRIT: 'bg-blue-100 text-blue-800',
    CONFIRME: 'bg-green-100 text-green-800',
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    QUALIFIE: 'bg-purple-100 text-purple-800',
    EN_DISCUSSION: 'bg-yellow-100 text-yellow-800',
    ACCEPTE: 'bg-green-100 text-green-800',
    REFUSE: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/** End of the calendar day of a date (a session dated "8 octobre" stays open all day long). */
function endOfDay(value: string | Date): Date {
  const d = new Date(value);
  d.setUTCHours(23, 59, 59, 999); // dates are stored at UTC midnight (Senegal is UTC+0)
  return d;
}

/**
 * Training timeline: registrations close once the first day is over;
 * the session is "terminée" once its last day (endDate, or date) is over.
 */
export function getTrainingStatus(
  date?: string | Date | null,
  endDate?: string | Date | null,
  now: Date = new Date(),
): 'upcoming' | 'ongoing' | 'past' {
  if (!date) return 'upcoming';
  if (endOfDay(endDate || date) < now) return 'past';
  if (endOfDay(date) < now) return 'ongoing';
  return 'upcoming';
}
