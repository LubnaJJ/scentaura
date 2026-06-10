import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import './AdminSettingsPage.css';

const AdminSettingsPage: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [identity, setIdentity] = useState({
    storeName: storeSettings.storeName,
    storeTagline: storeSettings.storeTagline,
  });

  const [hero, setHero] = useState({
    heroEyebrow: storeSettings.heroEyebrow,
    heroTitle: storeSettings.heroTitle,
    heroSubtitle: storeSettings.heroSubtitle,
  });

  const [contact, setContact] = useState({
    whatsappNumber: storeSettings.whatsappNumber,
    contactEmail: storeSettings.contactEmail,
  });

  const [footer, setFooter] = useState({
    footerTagline: storeSettings.footerTagline,
  });

  const save = (updates: object, label: string) => {
    updateStoreSettings(updates);
    toast.success(`${label} saved`);
  };

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Store Settings</h1>
        <p className="admin-page-sub">Manage your store identity, homepage content, and contact details.</p>
      </div>

      {/* Store Identity */}
      <div className="admin-card settings-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Store Identity</h3>
        </div>
        <div className="settings-card__body">
          <div className="form-field">
            <label>Store Name</label>
            <input
              type="text"
              value={identity.storeName}
              onChange={(e) => setIdentity((s) => ({ ...s, storeName: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label>Store Tagline</label>
            <input
              type="text"
              value={identity.storeTagline}
              onChange={(e) => setIdentity((s) => ({ ...s, storeTagline: e.target.value }))}
              placeholder="Shows under logo in navbar"
            />
          </div>
        </div>
        <div className="settings-card__footer">
          <button className="settings-save-btn" onClick={() => save(identity, 'Store identity')}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Homepage Hero */}
      <div className="admin-card settings-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Homepage Hero</h3>
        </div>
        <div className="settings-card__body">
          <div className="form-field">
            <label>Eyebrow Text</label>
            <input
              type="text"
              value={hero.heroEyebrow}
              onChange={(e) => setHero((s) => ({ ...s, heroEyebrow: e.target.value }))}
              placeholder="Small text above the title"
            />
          </div>
          <div className="form-field">
            <label>Hero Title</label>
            <input
              type="text"
              value={hero.heroTitle}
              onChange={(e) => setHero((s) => ({ ...s, heroTitle: e.target.value }))}
              placeholder="Main heading"
            />
          </div>
          <div className="form-field">
            <label>Hero Subtitle</label>
            <textarea
              rows={3}
              value={hero.heroSubtitle}
              onChange={(e) => setHero((s) => ({ ...s, heroSubtitle: e.target.value }))}
              placeholder="Paragraph below the title"
            />
          </div>
        </div>
        <div className="settings-card__footer">
          <button className="settings-save-btn" onClick={() => save(hero, 'Hero content')}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="admin-card settings-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Contact &amp; Social</h3>
        </div>
        <div className="settings-card__body">
          <div className="form-field">
            <label>WhatsApp Number</label>
            <input
              type="text"
              value={contact.whatsappNumber}
              onChange={(e) => setContact((s) => ({ ...s, whatsappNumber: e.target.value }))}
              placeholder="Without + sign, e.g. 94771770771"
            />
            <span className="settings-hint">Used for all WhatsApp links across the site.</span>
          </div>
          <div className="form-field">
            <label>Contact Email</label>
            <input
              type="email"
              value={contact.contactEmail}
              onChange={(e) => setContact((s) => ({ ...s, contactEmail: e.target.value }))}
              placeholder="hello@scentaura.lk"
            />
          </div>
        </div>
        <div className="settings-card__footer">
          <button className="settings-save-btn" onClick={() => save(contact, 'Contact details')}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="admin-card settings-card">
        <div className="admin-card__header">
          <h3 className="admin-card__title">Footer</h3>
        </div>
        <div className="settings-card__body">
          <div className="form-field">
            <label>Footer Tagline</label>
            <textarea
              rows={2}
              value={footer.footerTagline}
              onChange={(e) => setFooter({ footerTagline: e.target.value })}
              placeholder="Short description shown in the footer"
            />
          </div>
        </div>
        <div className="settings-card__footer">
          <button className="settings-save-btn" onClick={() => save(footer, 'Footer')}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
