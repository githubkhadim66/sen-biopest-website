'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, getWhatsAppUrl } from '@/lib/utils';
import { exportCSV, useDebouncedValue, type Paginated } from '@/lib/admin';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert } from '@/components/admin/alerts';
import { Search, Download, Loader2, Mail, MailOpen, MessageCircle, Trash2 } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesAdminPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const fetchMessages = useCallback(async () => {
    try {
      setError('');
      const params = new URLSearchParams({ limit: '100' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (onlyUnread) params.set('unread', 'true');
      const res = await api.get<Paginated<ContactMessage> & { unreadCount: number }>(`/contact?${params}`);
      setMessages(res.data);
      setTotal(res.total);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, onlyUnread]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function setRead(msg: ContactMessage, isRead: boolean) {
    if (msg.isRead === isRead) return;
    try {
      await api.put(`/contact/${msg.id}/${isRead ? 'read' : 'unread'}`);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead } : m)));
      setUnreadCount((c) => c + (isRead ? -1 : 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  function toggleOpen(msg: ContactMessage) {
    const opening = openId !== msg.id;
    setOpenId(opening ? msg.id : null);
    if (opening) setRead(msg, true);
  }

  async function handleDelete(msg: ContactMessage) {
    if (!confirm(`Supprimer le message de ${msg.name} ?`)) return;
    try {
      await api.delete(`/contact/${msg.id}`);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      setTotal((t) => t - 1);
      if (!msg.isRead) setUnreadCount((c) => c - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages de contact</h1>
          <p className="text-sm text-gray-500">
            {total} message{total > 1 ? 's' : ''} · {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={messages.length === 0}
          onClick={() =>
            exportCSV(
              ['Nom', 'Téléphone', 'Email', 'Sujet', 'Message', 'Lu', 'Date'],
              messages.map((m) => [m.name, m.phone, m.email, m.subject, m.message, m.isRead ? 'oui' : 'non', formatDate(m.createdAt)]),
              'messages-contact',
            )
          }
        >
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher par nom, téléphone, email, sujet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => setOnlyUnread(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Non lus uniquement
            </label>
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            {search || onlyUnread ? 'Aucun message pour ces critères.' : 'Aucun message reçu.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <Fragment key={msg.id}>
                <li
                  className={cn('px-5 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3', !msg.isRead && 'bg-primary-50/40')}
                  onClick={() => toggleOpen(msg)}
                >
                  {msg.isRead ? (
                    <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm truncate', msg.isRead ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                        {msg.name}
                      </span>
                      {msg.subject && <Badge variant="info">{msg.subject}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(msg.createdAt)}</span>
                </li>
                {openId === msg.id && (
                  <li className="px-5 py-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      {msg.phone}
                      {msg.email && (
                        <>
                          {' · '}
                          <a href={`mailto:${msg.email}`} className="text-primary-700 hover:underline">
                            {msg.email}
                          </a>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-4">{msg.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={getWhatsAppUrl(msg.phone, `Bonjour ${msg.name}, merci pour votre message à Sen Biopest.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="whatsapp">
                          <MessageCircle className="h-4 w-4" /> Répondre sur WhatsApp
                        </Button>
                      </a>
                      <Button size="sm" variant="outline" onClick={() => setRead(msg, false)}>
                        Marquer non lu
                      </Button>
                      {user?.role === 'ADMIN' && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(msg)}>
                          <Trash2 className="h-4 w-4" /> Supprimer
                        </Button>
                      )}
                    </div>
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
