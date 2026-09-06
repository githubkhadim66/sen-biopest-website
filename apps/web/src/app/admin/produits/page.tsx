'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Star, Eye, EyeOff, Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: { id: string; name: string; slug: string } | null;
  isFeatured: boolean;
  isPublished: boolean;
  primaryImage: string | null;
  images: ProductImage[];
  createdAt: string;
}

export default function ProduitsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    categoryId: '',
    description: '',
    isFeatured: false,
    isPublished: true,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get<{ data: Product[] }>('/admin/products');
      setProducts(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.get<{ id: string; name: string }[]>('/products/categories');
      setCategories(data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]!);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingImage(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function openCreate() {
    setEditingProduct(null);
    setForm({ name: '', shortDescription: '', categoryId: '', description: '', isFeatured: false, isPublished: true });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      shortDescription: product.shortDescription || '',
      categoryId: product.category?.id || '',
      description: product.description,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages(product.images?.map((img) => img.url) || []);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload new images first
      const uploadedUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        setUploading(true);
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const result = await api.upload<{ url: string }>('/uploads/admin', formData);
          uploadedUrls.push(result.url);
        }
        setUploading(false);
      }

      const payload = {
        ...form,
        categoryId: form.categoryId || undefined,
        imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setShowForm(false);
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function toggleField(product: Product, field: 'isPublished' | 'isFeatured') {
    try {
      await api.put(`/admin/products/${product.id}`, { [field]: !product[field] });
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Ajouter un produit
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
              <h2 className="text-lg font-semibold">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom du produit"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Select
                  label="Catégorie"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Sélectionner une catégorie"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                />
              </div>
              <Input
                label="Description courte"
                required
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              />
              <Textarea
                label="Description"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              {/* Upload images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos du produit
                </label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                  {imagePreviews.map((preview, i) => (
                    <div key={`new-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-green-300">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] text-center py-0.5">
                        Nouvelle
                      </span>
                    </div>
                  ))}
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 mt-1">Ajouter</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                {existingImages.length === 0 && imagePreviews.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">La première image sera l&apos;image principale du produit.</p>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Publié
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Mis en avant
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" loading={saving || uploading}>
                  {uploading ? 'Upload en cours...' : editingProduct ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {search ? 'Aucun produit trouvé pour cette recherche.' : 'Aucun produit enregistré.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Photo</th>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3 text-center">Vedette</th>
                  <th className="px-5 py-3 text-center">Publié</th>
                  <th className="px-5 py-3">Créé le</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      {product.primaryImage ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.primaryImage}`}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleField(product, 'isFeatured')}
                        className={cn(
                          'p-1 rounded transition-colors',
                          product.isFeatured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-gray-400'
                        )}
                        title={product.isFeatured ? 'Retirer la mise en avant' : 'Mettre en avant'}
                      >
                        <Star className="h-4 w-4" fill={product.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleField(product, 'isPublished')}
                        className={cn(
                          'p-1 rounded transition-colors',
                          product.isPublished ? 'text-green-600 hover:text-green-700' : 'text-gray-300 hover:text-gray-400'
                        )}
                        title={product.isPublished ? 'Dépublier' : 'Publier'}
                      >
                        {product.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
