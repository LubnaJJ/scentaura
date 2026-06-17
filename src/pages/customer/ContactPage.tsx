import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateId, openWhatsApp, CONTACT_EMAIL } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const addInquiry = useStore((s) => s.addInquiry);
  const storeSettings = useStore((s) => s.storeSettings);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', method: 'email' as 'email' | 'whatsapp' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) { toast.error('Please fill in all required fields'); return; }

    if (form.method === 'whatsapp') {
      openWhatsApp(`*${form.subject || 'Inquiry'}*\n\nFrom: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`);
    }

    addInquiry({
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString(),
      read: false,
    });
    setSubmitted(true);
    toast.success('Message sent successfully!');
  };

  return (
    <div className="contact">
      <div className="contact__hero">
        <div className="container">
          <p className="section__eyebrow">Get in Touch</p>
          <h1 className="contact__title">We're Here to Help</h1>
          <p className="contact__subtitle">
            Questions about fragrances? Need a personalised recommendation? Reach out — we respond fast.
          </p>
        </div>
      </div>

      <div className="container contact__body">
        <div className="contact__layout">
          {/* Info */}
          <div className="contact__info">
            <h2 className="contact__info-title">Reach Us Directly</h2>
            <p className="contact__info-desc">
              Our team is available every day to assist you with fragrance recommendations,
              order inquiries, and delivery support.
            </p>

            <div className="contact__channels">
              <button
                className="contact__channel contact__channel--wa"
                onClick={() => openWhatsApp('Hello, I would like to inquire about your fragrances.')}
              >
                <MessageCircle size={22} />
                <div>
                  <p className="contact__channel-label">WhatsApp (Fastest)</p>
                  <p className="contact__channel-val">+{storeSettings.whatsappNumber}</p>
                </div>
              </button>

              <a href={`mailto:${storeSettings.contactEmail}`} className="contact__channel">
                <Mail size={22} />
                <div>
                  <p className="contact__channel-label">Email</p>
                  <p className="contact__channel-val">{storeSettings.contactEmail}</p>
                </div>
              </a>

              <a href={`tel:+${storeSettings.whatsappNumber}`} className="contact__channel">
                <Phone size={22} />
                <div>
                  <p className="contact__channel-label">Phone</p>
                  <p className="contact__channel-val">+{storeSettings.whatsappNumber}</p>
                </div>
              </a>

              <div className="contact__channel contact__channel--location">
                <MapPin size={22} />
                <div>
                  <p className="contact__channel-label">Location</p>
                  <p className="contact__channel-val">Colombo, Sri Lanka</p>
                  <p className="contact__channel-sub">Island-wide delivery</p>
                </div>
              </div>
            </div>

            <div className="contact__hours">
              <p className="contact__hours-title">Hours</p>
              <div className="contact__hours-row">
                <span>Monday – Friday</span><span>9:00 AM – 8:00 PM</span>
              </div>
              <div className="contact__hours-row">
                <span>Saturday – Sunday</span><span>10:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact__form-wrap">
            {submitted ? (
              <div className="contact__form-success">
                <Send size={40} className="contact__success-icon" />
                <h3>Message Sent!</h3>
                <p>We've received your inquiry and will get back to you within a few hours.</p>
                <button className="btn btn--gold" onClick={() => setSubmitted(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact__form" noValidate>
                <h2 className="contact__form-title">Send a Message</h2>

                <div className="form-row-2">
                  <div className="form-field">
                    <label>Your Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Ahmed Farhan" required />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="0771234567" />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" type="email" />
                </div>

                <div className="form-field">
                  <label>Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="Fragrance recommendation, order inquiry..." />
                </div>

                <div className="form-field">
                  <label>Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us how we can help..." required />
                </div>

                <div className="form-field">
                  <label>Preferred Reply Method</label>
                  <div className="contact__method-options">
                    {[
                      { value: 'email', label: 'Email', icon: <Mail size={15} /> },
                      { value: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={15} /> },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`contact__method-opt ${form.method === opt.value ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={opt.value}
                          checked={form.method === opt.value}
                          onChange={handleChange}
                          hidden
                        />
                        {opt.icon} {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn--gold contact__submit">
                  <Send size={15} />
                  {form.method === 'whatsapp' ? 'Send via WhatsApp' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
