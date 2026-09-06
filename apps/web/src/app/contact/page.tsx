'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardBody } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getWhatsAppUrl, WHATSAPP_NUMBER, formatPhone } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z
    .string()
    .min(9, 'Numéro de téléphone invalide')
    .regex(/^[+]?[0-9\s-]{9,15}$/, 'Format de téléphone invalide'),
  email: z.string().email('Adresse email invalide'),
  subject: z.string().min(1, 'Veuillez sélectionner un sujet'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialité' }),
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjectOptions = [
  { value: 'devis', label: 'Demande de devis' },
  { value: 'produit', label: 'Information sur un produit' },
  { value: 'formation', label: 'Inscription formation' },
  { value: 'accompagnement', label: 'Accompagnement technique' },
  { value: 'partenariat', label: 'Proposition de partenariat' },
  { value: 'autre', label: 'Autre' },
];

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresse',
    content: 'Dakar, Sénégal',
    detail: 'Zone industrielle, Lot 42',
  },
  {
    icon: Phone,
    title: 'Téléphone',
    content: formatPhone('+221770000000'),
    detail: 'Lundi - Vendredi, 8h - 18h',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'contact@senbiopest.sn',
    detail: 'Réponse sous 24h',
  },
  {
    icon: Clock,
    title: 'Horaires',
    content: 'Lun - Ven : 8h - 18h',
    detail: 'Sam : 9h - 13h',
  },
];

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitStatus('idle');
      setErrorMessage('');
      await api.post('/contact', {
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
      setSubmitStatus('success');
      reset();
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-green-50 overflow-hidden">
        <div className="container-wide py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Mail className="w-4 h-4" />
              Contact
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Une question, une demande de devis ou envie de collaborer ? Notre équipe est à votre écoute et vous répond sous 24h.
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary-100/40 to-transparent hidden lg:block" />
      </section>

      {/* Contact Info + Form */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Nos coordonnées</h2>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <Card key={info.title}>
                    <CardBody className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                        <info.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{info.title}</h3>
                        <p className="text-gray-700 text-sm">{info.content}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{info.detail}</p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={getWhatsAppUrl(
                  WHATSAPP_NUMBER,
                  'Bonjour Sen Biopest, je souhaite en savoir plus sur vos produits et services.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card hover className="border-[#25D366]/30 bg-[#25D366]/5">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Écrivez-nous sur WhatsApp</h3>
                      <p className="text-sm text-gray-600">
                        Réponse rapide, envoyez-nous photos et questions directement.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </a>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardBody className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

                  {submitStatus === 'success' && (
                    <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Message envoyé avec succès !</p>
                        <p className="text-sm text-green-700 mt-1">
                          Nous avons bien reçu votre message et vous répondrons sous 24h.
                        </p>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Erreur lors de l'envoi</p>
                        <p className="text-sm text-red-700 mt-1">
                          {errorMessage || 'Une erreur est survenue. Veuillez réessayer ou nous contacter par WhatsApp.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        id="name"
                        label="Nom complet"
                        placeholder="Votre nom"
                        required
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        id="phone"
                        label="Téléphone"
                        type="tel"
                        placeholder="+221 77 000 00 00"
                        required
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>

                    <Input
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <Select
                      id="subject"
                      label="Sujet"
                      placeholder="Sélectionnez un sujet"
                      required
                      options={subjectOptions}
                      error={errors.subject?.message}
                      {...register('subject')}
                    />

                    <Textarea
                      id="message"
                      label="Message"
                      placeholder="Décrivez votre demande en détail..."
                      required
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    <div className="space-y-1">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          {...register('consent')}
                        />
                        <span className="text-sm text-gray-600">
                          J'accepte que mes données soient traitées conformément à la{' '}
                          <Link
                            href="/confidentialite"
                            className="text-primary-600 underline hover:text-primary-700"
                          >
                            politique de confidentialité
                          </Link>{' '}
                          de Sen Biopest. <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.consent && (
                        <p className="text-sm text-red-600">{errors.consent.message}</p>
                      )}
                    </div>

                    <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
                      <Send className="w-5 h-5" />
                      Envoyer le message
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
