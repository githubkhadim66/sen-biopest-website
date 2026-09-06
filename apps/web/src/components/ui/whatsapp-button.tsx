'use client';

import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_NUMBER } from '@/lib/utils';
import { api } from '@/lib/api';

export function WhatsAppButton() {
  const handleClick = () => {
    api.post('/content/track-click', {
      ctaType: 'whatsapp',
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
    }).catch(() => {});
  };

  return (
    <a
      href={getWhatsAppUrl(WHATSAPP_NUMBER, 'Bonjour Sen Biopest, je souhaite en savoir plus sur vos produits.')}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all duration-200"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline font-semibold">WhatsApp</span>
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
