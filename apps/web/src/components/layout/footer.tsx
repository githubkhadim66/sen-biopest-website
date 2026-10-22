'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatPhone } from '@/lib/utils';
import { Leaf, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';

export function Footer() {
  const site = useSiteSettings();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <Leaf className="w-6 h-6 text-primary-400" />
              <span>Sen Biopest</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Biopesticides naturels à base de plantes locales pour une agriculture saine et durable au Sénégal.
            </p>
            <div className="flex gap-2 pt-2">
              {['100% naturel', 'Made in Sénégal'].map((badge) => (
                <span key={badge} className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Produits', href: '/produits' },
                { label: 'Formations', href: '/formations' },
                { label: 'Accompagnement', href: '/accompagnement-technique' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Accompagnement technique', href: '/accompagnement-technique' },
                { label: 'Formations', href: '/formations' },
                { label: 'Partenariats', href: '/partenariats' },
                { label: 'Contact', href: '/contact' },
                { label: 'Demander un devis', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <span className="pt-1">{site.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary-400" />
                </div>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-white">{formatPhone(site.phone)}</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary-400" />
                </div>
                <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Sen Biopest. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="hover:text-primary-400 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-primary-400 transition-colors">Confidentialité</Link>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Retour en haut"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
