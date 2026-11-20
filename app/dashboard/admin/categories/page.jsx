'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FolderTree, Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Code');

  const fetchCats = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon }),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Category created 🌱');
      setName('');
      fetchCats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
          Discipline & Craft Categories
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Manage the career disciplines shown on the landing page and search filters.
        </p>
      </div>

      <Card padding="normal">
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="New category name (e.g. AI & Machine Learning)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="primary" icon={Plus}>
            Add Discipline
          </Button>
        </form>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {categories.map((cat) => (
          <Card key={cat.slug || cat._id} padding="normal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--green-900)' }}>
                  {cat.name}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {cat.jobCount || 0} active roles
                </span>
              </div>
              <Tag size={20} color="var(--green-600)" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
