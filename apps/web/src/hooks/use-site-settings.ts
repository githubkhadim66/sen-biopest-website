'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { WHATSAPP_NUMBER } from '@/lib/utils';

export interface SiteSettings {
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
}

const DEFAULTS: SiteSettings = {
  whatsappNumber: WHATSAPP_NUMBER,
  phone: WHATSAPP_NUMBER,
  email: 'contact@senbiopest.com',
  address: 'Dakar, Sénégal',
};

/**
 * Contact details edited in Admin > Paramètres. One cached request for the whole
 * site; until it answers (or if it fails) the build-time defaults are used.
 */
export function useSiteSettings(): SiteSettings {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => api.get<{ key: string; value: string }[]>('/content/settings'),
    staleTime: 10 * 60 * 1000,
  });

  if (!data) return DEFAULTS;
  const values = Object.fromEntries(data.map((s) => [s.key, s.value]));
  return {
    whatsappNumber: values.whatsapp_number || DEFAULTS.whatsappNumber,
    phone: values.company_phone || DEFAULTS.phone,
    email: values.company_email || DEFAULTS.email,
    address: values.company_address || DEFAULTS.address,
  };
}
