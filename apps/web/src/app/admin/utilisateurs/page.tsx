'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, X, UserCheck, UserX, Shield } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'TECHNICIEN', label: 'Technicien' },
];

export default function UtilisateursAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'COMMERCIAL',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<{ users: User[] }>('/auth/users');
      setUsers(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/users', form);
      setShowForm(false);
      setForm({ fullName: '', email: '', password: '', role: 'COMMERCIAL' });
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await api.put(`/auth/users/${user.id}`, { active: !user.active });
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleRoleChange(user: User, role: string) {
    try {
      await api.put(`/auth/users/${user.id}`, { role });
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  function roleIcon(role: string) {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-3.5 w-3.5 text-purple-600" />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Créer un utilisateur</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom complet"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mot de passe"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Select
                  label="Rôle"
                  options={ROLE_OPTIONS}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={saving}>
                  Créer
                </Button>
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
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">Aucun utilisateur.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                  <th className="px-5 py-3">Créé le</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {roleIcon(user.role)}
                        <span className="font-medium text-gray-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{user.email}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Select
                        options={ROLE_OPTIONS}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className="w-40 text-xs"
                      />
                    </td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <Badge className={user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          user.active ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'
                        )}
                        title={user.active ? 'Désactiver' : 'Activer'}
                      >
                        {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
