import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthorSetupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    bookTitle: '',
    amazonReviewLink: '',
    supportMessage: '',
    brandColor: '#3b82f6',
    slug: ''
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  const generateSlug = (name, title) => {
    const combined = `${name}-${title}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if ((name === 'authorName' || name === 'bookTitle') && !formData.slug) {
      const newSlug = generateSlug(
        name === 'authorName' ? value : formData.authorName,
        name === 'bookTitle' ? value : formData.bookTitle
      );
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalSlug = formData.slug || generateSlug(formData.authorName, formData.bookTitle);

      const { data, error: insertError } = await supabase
        .from('authors')
        .insert({
          author_name: formData.authorName,
          book_title: formData.bookTitle,
          amazon_review_link: formData.amazonReviewLink,
          support_message: formData.supportMessage || null,
          brand_color: formData.brandColor || null,
          slug: finalSlug
        })
        .select()
        .maybeSingle();

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This slug already exists. Please choose a different one.');
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      setCreatedSlug(finalSlug);
      setShowSuccess(true);
    } catch (err) {
      setError('Failed to create review funnel. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `${window.location.origin}/review/${createdSlug}`;
  const dashboardUrl = `${window.location.origin}/dashboard/${createdSlug}`;

  const linkedInPost = `I'd love to hear your thoughts on ${formData.bookTitle}! 📚

If you've read it, would you share a quick review? I've created a simple tool to help you draft one in just a few minutes:

${publicUrl}

Your feedback means the world to me. Thank you! 🙏`;

  const emailCopy = `Hi there,

I hope you enjoyed reading ${formData.bookTitle}!

If you have a few minutes, I'd be incredibly grateful if you could share your thoughts in an Amazon review. To make it easy, I've set up a simple tool that helps you draft a review in just 3 quick prompts:

${publicUrl}

Your feedback helps other readers discover the book and means so much to me.

Thank you for your support!

Best,
${formData.authorName}`;

  if (showSuccess) {
    return (
      <div className="app-container">
        <div className="app-content">
          <div className="card card-wide">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h1 className="heading-xl">Your Review Funnel is Live!</h1>
              <p className="text-muted">Share this link with your readers</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">Public Review Page</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(publicUrl)}
                  className="btn btn-secondary"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">Dashboard</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={dashboardUrl}
                  readOnly
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => navigate(`/dashboard/${createdSlug}`)}
                  className="btn btn-secondary"
                >
                  View Dashboard
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">Suggested LinkedIn Post</label>
              <textarea
                value={linkedInPost}
                readOnly
                className="textarea"
                rows="8"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(linkedInPost)}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
              >
                Copy LinkedIn Post
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label className="label">Suggested Email Copy</label>
              <textarea
                value={emailCopy}
                readOnly
                className="textarea"
                rows="12"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(emailCopy)}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
              >
                Copy Email Template
              </button>
            </div>

            <div className="btn-group">
              <button
                onClick={() => navigate(`/review/${createdSlug}`)}
                className="btn btn-primary"
              >
                View Public Page
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-text"
              >
                Create Another Funnel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="card card-wide">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="heading-xl">Create Your Review Funnel</h1>
            <p className="text-muted">Set up a shareable page for your readers to submit reviews</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Author Name *</label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="input"
                required
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Book Title *</label>
              <input
                type="text"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
                className="input"
                required
                placeholder="The Art of Writing"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Amazon Review Link *</label>
              <input
                type="url"
                name="amazonReviewLink"
                value={formData.amazonReviewLink}
                onChange={handleChange}
                className="input"
                required
                placeholder="https://amazon.com/review/create-review"
              />
              <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                The URL where readers can post their review on Amazon
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Support Message (Optional)</label>
              <textarea
                name="supportMessage"
                value={formData.supportMessage}
                onChange={handleChange}
                className="textarea"
                rows="3"
                placeholder="Thank you for taking the time to share your thoughts!"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Brand Color (Optional)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  style={{ width: '60px', height: '40px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <input
                  type="text"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  className="input"
                  placeholder="#3b82f6"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">URL Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="input"
                required
                placeholder="author-name-book-title"
              />
              <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                Your public page will be at: /review/{formData.slug || 'your-slug'}
              </p>
            </div>

            {error && (
              <div className="info-box" style={{ marginBottom: '1.5rem', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating...' : 'Create My Review Funnel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
