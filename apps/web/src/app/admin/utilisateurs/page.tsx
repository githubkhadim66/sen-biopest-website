'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/admin';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert, SuccessAlert } from '@/components/admin/alerts';
import { Plus, Loader2, X, UserCheck, UserX, KeyRound } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'COMMERCIAL' };

export default function UtilisateursAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      setUsers(await api.get<User[]>('/auth/users'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function update(user: User, data: Partial<User> & { password?: string }, message: string) {
    try {
      setError('');
      const updated = await api.put<User>(`/auth/users/${user.id}`, data);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await api.post<User>('/auth/users', form);
      setUsers((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setSuccess(`Compte créé pour ${created.firstName} ${created.lastName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  function handleResetPassword(user: User) {
    const password = prompt(`Nouveau mot de passe pour ${user.firstName} ${user.lastName} (8 caractères minimum) :`);
    if (password === null) return;
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    update(user, { password }, 'Mot de passe modifié.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onDone={() => setSuccess('')} />

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="u-first" label="Prénom" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input id="u-last" label="Nom" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <Input id="u-email" label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input
                id="u-pass"
                label="Mot de passe provisoire"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Select id="u-role" label="Rôle" options={ROLE_OPTIONS} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" loading={saving}>Créer le compte</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Créé le</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={u.isActive ? '' : 'bg-gray-50 text-gray-400'}>
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {u.firstName} {u.lastName}
                        {isSelf && <span className="ml-2 text-xs text-gray-400">(vous)</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{u.email}</td>
                      <td className="px-5 py-3">
                        <Select
                          options={ROLE_OPTIONS}
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => update(u, { role: e.target.value }, 'Rôle mis à jour.')}
                          className="w-48 py-1.5"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Actif' : 'Désactivé'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleResetPassword(u)} className="p-2 text-gray-400 hover:text-primary-600" title="Changer le mot de passe">
                            <KeyRound className="h-4 w-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => update(u, { isActive: !u.isActive }, u.isActive ? 'Compte désactivé.' : 'Compte réactivé.')}
                              className={u.isActive ? 'p-2 text-gray-400 hover:text-red-600' : 'p-2 text-gray-400 hover:text-green-600'}
                              title={u.isActive ? 'Désactiver' : 'Réactiver'}
                            >
                              {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
