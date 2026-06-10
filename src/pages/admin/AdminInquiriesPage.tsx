import React, { useState } from 'react';
import { Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDate, openWhatsApp } from '../../utils/helpers';
import './AdminInquiriesPage.css';

const AdminInquiriesPage: React.FC = () => {
  const { inquiries, markInquiryRead } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? inquiries.filter((i) => !i.read) : inquiries;

  return (
    <div className="admin-inquiries">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inquiries</h1>
          <p className="admin-page-sub">{inquiries.filter((i) => !i.read).length} unread messages</p>
        </div>
        <div className="admin-inquiries__filter-tabs">
          <button className={`admin-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({inquiries.length})</button>
          <button className={`admin-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread ({inquiries.filter((i) => !i.read).length})
          </button>
        </div>
      </div>

      <div className="inquiries-list">
        {filtered.length === 0 ? (
          <div className="admin-card"><p className="admin-empty">No inquiries yet.</p></div>
        ) : (
          filtered.map((inq) => (
            <div
              key={inq.id}
              className={`inquiry-card admin-card ${!inq.read ? 'inquiry-card--unread' : ''}`}
            >
              <div className="inquiry-card__header">
                <div className="inquiry-card__meta">
                  <span className="inquiry-card__name">{inq.name}</span>
                  {!inq.read && <span className="inquiry-unread-dot" />}
                  <span className="inquiry-card__date">{formatDate(inq.createdAt)}</span>
                  <span className={`inquiry-method ${inq.method === 'whatsapp' ? 'inquiry-method--wa' : ''}`}>
                    {inq.method === 'whatsapp' ? <MessageCircle size={12} /> : <Mail size={12} />}
                    {inq.method === 'whatsapp' ? 'WhatsApp' : 'Email'}
                  </span>
                </div>
                <div className="inquiry-card__actions">
                  {!inq.read && (
                    <button className="inquiry-mark-read-btn" onClick={() => markInquiryRead(inq.id)}>
                      <CheckCircle size={14} /> Mark read
                    </button>
                  )}
                  {inq.method === 'whatsapp' && inq.phone && (
                    <button
                      className="inquiry-reply-btn inquiry-reply-btn--wa"
                      onClick={() => openWhatsApp(`Hello ${inq.name}, regarding your inquiry: "${inq.subject || 'your message'}"...`)}
                    >
                      <MessageCircle size={14} /> Reply on WhatsApp
                    </button>
                  )}
                  {inq.email && (
                    <a
                      href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Your Inquiry'}`}
                      className="inquiry-reply-btn"
                    >
                      <Mail size={14} /> Reply by Email
                    </a>
                  )}
                </div>
              </div>

              <div className="inquiry-card__contact">
                {inq.email && <span><Mail size={12} /> {inq.email}</span>}
                {inq.phone && <span><MessageCircle size={12} /> {inq.phone}</span>}
              </div>

              {inq.subject && <p className="inquiry-card__subject">{inq.subject}</p>}
              <p className="inquiry-card__message">{inq.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminInquiriesPage;
