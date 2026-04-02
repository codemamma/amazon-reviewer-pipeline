import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { hashPassword } from '../utils/passwordHash';

export default function AuthorSetupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    bookTitle: '',
    amazonReviewLink: '',
    supportMessage: '',
    brandColor: '#3b82f6',
    slug: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const finalSlug = formData.slug || generateSlug(formData.authorName, formData.bookTitle);
      const passwordHash = await hashPassword(formData.password);

      const { data, error: insertError } = await supabase
        .from('authors')
        .insert({
          author_name: formData.authorName,
          book_title: formData.bookTitle,
          amazon_review_link: formData.amazonReviewLink,
          support_message: formData.supportMessage || null,
          brand_color: formData.brandColor || null,
          slug: finalSlug,
          email: formData.email,
          password_hash: passwordHash
        })
        .select()
        .maybeSingle();

      if (insertError) {
        if (insertError.code === '23505') {
          if (insertError.message.includes('email')) {
            setError('This email is already registered. Please use a different email or visit "My Funnels" to log in.');
          } else {
            setError('This slug already exists. Please choose a different one.');
          }
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      // Send dashboard email
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const dashboardUrl = `${window.location.origin}/dashboard/${finalSlug}`;
        const publicUrl = `${window.location.origin}/review/${finalSlug}`;

        await fetch(`${supabaseUrl}/functions/v1/send-dashboard-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: formData.email,
            authorName: formData.authorName,
            bookTitle: formData.bookTitle,
            dashboardUrl,
            publicUrl
          })
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
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
            <div className="text-center mb-2">
              <div className="heading-xl mb-1.5">🎉</div>
              <h1 className="heading-xl">Your Review Funnel is Live!</h1>
              <p className="text-muted">Dashboard link sent to {formData.email}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Public Review Page</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="form-input"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(publicUrl)}
                  className="btn btn-secondary"
                >
                  Copy Link
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dashboard</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={dashboardUrl}
                  readOnly
                  className="form-input"
                />
                <button
                  onClick={() => navigate(`/dashboard/${createdSlug}`)}
                  className="btn btn-secondary"
                >
                  View Dashboard
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Suggested LinkedIn Post</label>
              <textarea
                value={linkedInPost}
                readOnly
                className="form-textarea"
                rows="8"
              />
              <button
                onClick={() => navigator.clipboard.writeText(linkedInPost)}
                className="btn btn-secondary mt-0.5"
              >
                Copy LinkedIn Post
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Suggested Email Copy</label>
              <textarea
                value={emailCopy}
                readOnly
                className="form-textarea"
                rows="12"
              />
              <button
                onClick={() => navigator.clipboard.writeText(emailCopy)}
                className="btn btn-secondary mt-0.5"
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
                onClick={() => navigate('/my-funnels')}
                className="btn btn-secondary"
              >
                View All My Funnels
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
          <div className="text-center mb-2">
            <h1 className="heading-xl">Create Your Review Funnel</h1>
            <p className="text-muted">Set up a shareable page for your readers to submit reviews</p>
            <div className="mt-1">
              <button
                onClick={() => navigate('/my-funnels')}
                className="btn-text"
              >
                View My Existing Funnels
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Author Name *</label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Book Title *</label>
              <input
                type="text"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="The Art of Writing"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amazon Review Link *</label>
              <input
                type="url"
                name="amazonReviewLink"
                value={formData.amazonReviewLink}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="https://amazon.com/review/create-review"
              />
              <p className="text-sm text-muted mt-0.25">
                The URL where readers can post their review on Amazon
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="author@example.com"
              />
              <p className="text-sm text-muted mt-0.25">
                We'll email you the dashboard link and use this for login
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="At least 6 characters"
                minLength="6"
              />
              <p className="text-sm text-muted mt-0.25">
                Protect your dashboard with a password
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Re-enter your password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Message (Optional)</label>
              <textarea
                name="supportMessage"
                value={formData.supportMessage}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Thank you for taking the time to share your thoughts!"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Color (Optional)</label>
              <div className="flex gap-1 items-center">
                <input
                  type="color"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  className="color-picker"
                />
                <input
                  type="text"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="author-name-book-title"
              />
              <p className="text-sm text-muted mt-0.25">
                Your public page will be at: /review/{formData.slug || 'your-slug'}
              </p>
            </div>

            {error && (
              <div className="error-box mb-1.5">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create My Review Funnel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
