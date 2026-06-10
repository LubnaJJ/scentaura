import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductCategory } from '../../types';
import { formatPrice, generateId } from '../../utils/helpers';
import { uploadImage, validateImageFile } from '../../lib/cloudinary';
import toast from 'react-hot-toast';
import './AdminProductsPage.css';

type UploadSlot = { id: string; file: File; progress: number };

const EMPTY_PRODUCT: Omit<Product, 'id' | 'createdAt'> = {
  name: '', brand: '', price: 0, description: '', longDescription: '',
  category: 'oud', size: ['50ml', '100ml'], images: [],
  topNotes: [], heartNotes: [], baseNotes: [],
  inStock: true, featured: false, bestseller: false,
  stockQuantity: 50,
};

const CATEGORIES: ProductCategory[] = ['oud', 'musk', 'floral', 'woody', 'oriental', 'fresh'];

const AdminProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt'>>(EMPTY_PRODUCT);

  // Image upload state
  const [uploading, setUploading] = useState<UploadSlot[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = () => {
    setUploading([]);
    setShowUrlInput(false);
    setManualUrl('');
    setDragging(false);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT, images: [] });
    setEditingId(null);
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    const { id, createdAt, ...rest } = p;
    setForm(rest);
    setEditingId(id);
    resetImageState();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetImageState();
  };

  // ── Image upload handlers ─────────────────────────────────────────────────

  const handleFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const currentCount = form.images.filter(Boolean).length + uploading.length;
    const slots = Math.max(0, 5 - currentCount);

    arr.slice(0, slots).forEach((file) => {
      const err = validateImageFile(file);
      if (err) { toast.error(err); return; }

      const tempId = generateId();
      setUploading((prev) => [...prev, { id: tempId, file, progress: 0 }]);

      uploadImage(file, (pct) => {
        setUploading((prev) =>
          prev.map((u) => u.id === tempId ? { ...u, progress: pct } : u)
        );
      })
        .then((url) => {
          setForm((f) => ({ ...f, images: [...f.images.filter(Boolean), url] }));
          setUploading((prev) => prev.filter((u) => u.id !== tempId));
        })
        .catch(() => {
          toast.error(`Failed to upload ${file.name}`);
          setUploading((prev) => prev.filter((u) => u.id !== tempId));
        });
    });

    if (arr.length > slots) {
      toast.error(`Max 5 images per product. ${arr.length - slots} file(s) skipped.`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const addManualUrl = () => {
    const url = manualUrl.trim();
    if (!url) return;
    const count = form.images.filter(Boolean).length + uploading.length;
    if (count >= 5) { toast.error('Max 5 images per product'); return; }
    setForm((f) => ({ ...f, images: [...f.images.filter(Boolean), url] }));
    setManualUrl('');
  };

  // ── Form handlers ─────────────────────────────────────────────────────────

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(id);
      toast.success('Product deleted');
    }
  };

  const handleSave = () => {
    if (!form.name || !form.brand || !form.price) {
      toast.error('Name, brand, and price are required');
      return;
    }
    if (form.images.filter(Boolean).length === 0) {
      toast.error('At least one product image is required');
      return;
    }
    if (uploading.length > 0) {
      toast.error('Please wait for images to finish uploading');
      return;
    }
    if (editingId) {
      updateProduct(editingId, form);
      toast.success('Product updated');
    } else {
      addProduct({ ...form, id: generateId(), createdAt: new Date().toISOString() });
      toast.success('Product added');
    }
    closeModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }));
  };

  const handleArrayField = (field: 'size' | 'topNotes' | 'heartNotes' | 'baseNotes', value: string) => {
    setForm((f) => ({ ...f, [field]: value.split(',').map((v) => v.trim()).filter(Boolean) }));
  };

  const imageCount = form.images.filter(Boolean).length + uploading.length;

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">{products.length} fragrances in your catalogue</p>
        </div>
        <button className="btn btn--gold admin-add-btn" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sizes</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="product-row">
                      {p.images[0] && (
                        <img src={p.images[0]} alt={p.name} className="product-row__img" />
                      )}
                      <div>
                        <p className="admin-table__name">{p.name}</p>
                        <p className="admin-table__sub">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-cat-badge">{p.category}</span></td>
                  <td className="admin-table__bold">{formatPrice(p.price)}</td>
                  <td className="admin-table__muted">{p.size.join(', ')}</td>
                  <td>
                    <span className={`admin-stock-qty ${(p.stockQuantity ?? 50) <= 5 ? 'admin-stock-qty--low' : ''}`}>
                      {p.stockQuantity ?? 50}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${p.inStock ? 'admin-status-badge--green' : 'admin-status-badge--red'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="product-flags">
                      {p.featured && <span className="product-flag product-flag--featured">Featured</span>}
                      {p.bestseller && <span className="product-flag product-flag--best">Bestseller</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(p)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(p.id, p.name)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="admin-empty">No products yet. Add your first fragrance.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="admin-modal__close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-grid">

                {/* Basic info */}
                <div className="form-field">
                  <label>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Oud Al Shams" />
                </div>
                <div className="form-field">
                  <label>Brand *</label>
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="Arabian Essence" />
                </div>
                <div className="form-field">
                  <label>Price (LKR) *</label>
                  <input name="price" type="number" value={form.price || ''} onChange={handleChange} placeholder="12500" />
                </div>
                <div className="form-field">
                  <label>Original Price (LKR)</label>
                  <input name="originalPrice" type="number" value={form.originalPrice || ''} onChange={handleChange} placeholder="15000" />
                </div>
                <div className="form-field">
                  <label>Stock Quantity</label>
                  <input name="stockQuantity" type="number" min="0" value={form.stockQuantity ?? 50} onChange={handleChange} placeholder="50" />
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Sizes (comma-separated)</label>
                  <input value={form.size.join(', ')} onChange={(e) => handleArrayField('size', e.target.value)} placeholder="50ml, 100ml, 150ml" />
                </div>
                <div className="form-field admin-form-grid__full">
                  <label>Short Description</label>
                  <input name="description" value={form.description} onChange={handleChange} placeholder="One-line tagline for the product" />
                </div>
                <div className="form-field admin-form-grid__full">
                  <label>Full Description</label>
                  <textarea name="longDescription" value={form.longDescription} onChange={handleChange} rows={3} placeholder="Detailed product description..." />
                </div>

                {/* Image upload section */}
                <div className="form-field admin-form-grid__full">
                  <label>Product Images * {imageCount > 0 && <span className="image-count-hint">({imageCount}/5)</span>}</label>

                  {/* Thumbnails row */}
                  {imageCount > 0 && (
                    <div className="image-thumbs">
                      {form.images.filter(Boolean).map((url, i) => (
                        <div key={url + i} className="image-thumb">
                          <img src={url} alt="" />
                          <button
                            type="button"
                            className="image-thumb__remove"
                            onClick={() => removeImage(i)}
                          >×</button>
                        </div>
                      ))}
                      {uploading.map((u) => (
                        <div key={u.id} className="image-thumb image-thumb--loading">
                          <div className="image-thumb__spinner" />
                          <div className="image-thumb__progress">
                            <div className="image-thumb__progress-bar" style={{ width: `${u.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone (hidden when at 5 images) */}
                  {imageCount < 5 && (
                    <div
                      className={`image-upload-zone${dragging ? ' dragging' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      <div className="image-upload-zone__icon">📷</div>
                      <p className="image-upload-zone__text">Click to upload or drag images here</p>
                      <p className="image-upload-zone__sub">JPG, PNG, WebP — max 5MB each — up to 5 images</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
                  />

                  {/* Manual URL toggle */}
                  <button type="button" className="image-url-toggle" onClick={() => setShowUrlInput((v) => !v)}>
                    {showUrlInput ? 'Hide URL input' : 'Or add image URL manually'}
                  </button>

                  {showUrlInput && (
                    <div className="image-url-input-row">
                      <input
                        type="text"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        onKeyDown={(e) => e.key === 'Enter' && addManualUrl()}
                      />
                      <button type="button" className="image-url-add-btn" onClick={addManualUrl}>
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Fragrance notes */}
                <div className="form-field">
                  <label>Top Notes (comma-separated)</label>
                  <input value={form.topNotes.join(', ')} onChange={(e) => handleArrayField('topNotes', e.target.value)} placeholder="Bergamot, Black Pepper" />
                </div>
                <div className="form-field">
                  <label>Heart Notes (comma-separated)</label>
                  <input value={form.heartNotes.join(', ')} onChange={(e) => handleArrayField('heartNotes', e.target.value)} placeholder="Amber, Rose, Saffron" />
                </div>
                <div className="form-field admin-form-grid__full">
                  <label>Base Notes (comma-separated)</label>
                  <input value={form.baseNotes.join(', ')} onChange={(e) => handleArrayField('baseNotes', e.target.value)} placeholder="Sandalwood, Musk" />
                </div>

                {/* Flags */}
                <div className="admin-checkboxes">
                  {[
                    { name: 'inStock', label: 'In Stock' },
                    { name: 'featured', label: 'Featured' },
                    { name: 'bestseller', label: 'Bestseller' },
                  ].map((opt) => (
                    <label key={opt.name} className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        name={opt.name}
                        checked={!!form[opt.name as keyof typeof form]}
                        onChange={handleChange}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--gold admin-save-btn" onClick={handleSave}>
                <Check size={15} /> {editingId ? 'Save Changes' : 'Add Product'}
              </button>
              <button className="admin-cancel-btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
