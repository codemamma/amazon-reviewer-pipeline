import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateReview } from '../utils/multiAuthorReviewGenerator';

export default function ReaderReviewPage() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    takeaway: '',
    recommendation: '',
    standout: ''
  });
  const [review, setReview] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showLong, setShowLong] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAuthor();
  }, [slug]);

  const fetchAuthor = async () => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setAuthor(null);
      } else {
        setAuthor(data);
      }
    } catch (err) {
      console.error('Error fetching author:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const generatedReview = generateReview(
      formData.takeaway,
      formData.recommendation,
      formData.standout,
      author.book_title
    );
    setReview(generatedReview);

    try {
      const { data, error } = await supabase
        .from('review_attempts')
        .insert({
          author_id: author.id,
          email: formData.email,
          takeaway: formData.takeaway,
          recommendation: formData.recommendation,
          standout: formData.standout,
          short_review: generatedReview.shortReview,
          long_review: generatedReview.longReview,
          review_generated: true,
          copied: false,
          clicked_amazon: false
        })
        .select()
        .maybeSingle();

      if (data) {
        setAttemptId(data.id);
      }

      if (error) {
        console.error('Error tracking review generation:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
      setStep(2);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (attemptId) {
        await supabase
          .from('review_attempts')
          .update({ copied: true })
          .eq('id', attemptId);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAndOpenAmazon = async () => {
    await handleCopy(review.shortReview);

    if (attemptId) {
      try {
        await supabase
          .from('review_attempts')
          .update({ clicked_amazon: true })
          .eq('id', attemptId);
      } catch (err) {
        console.error('Error updating Amazon click status:', err);
      }
    }

    setTimeout(() => {
      window.open(author.amazon_review_link, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="app-content">
          <div className="card">
            <h1 className="heading-lg">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="app-container">
        <div className="app-content">
          <div className="card">
            <h1 className="heading-lg">Review Funnel Not Found</h1>
            <p className="text-muted">This review page does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const brandColor = author.brand_color || '#3b82f6';

  return (
    <div className="app-container">
      <style>
        {`
          .btn-primary {
            background-color: ${brandColor};
            border-color: ${brandColor};
          }
          .btn-primary:hover {
            opacity: 0.9;
          }
        `}
      </style>
      <div className="app-content">
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Step 1 of 2</span>
              </div>
            </div>

            <div className="card card-wide">
              <h1 className="heading-xl" style={{ textAlign: 'center' }}>
                Support {author.author_name} by sharing your thoughts on {author.book_title}
              </h1>
              <p className="text-muted" style={{ textAlign: 'center', fontSize: '1.125rem', marginBottom: '2rem' }}>
                Answer 3 quick prompts and we'll help you draft an Amazon-ready review you can copy and post.
              </p>

              {author.support_message && (
                <div className="info-box" style={{ marginBottom: '2rem' }}>
                  <p className="text-sm">{author.support_message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Your Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">What was your biggest takeaway from the book? *</label>
                  <textarea
                    name="takeaway"
                    value={formData.takeaway}
                    onChange={handleChange}
                    className="textarea"
                    rows="4"
                    required
                    placeholder="The main insight or lesson that resonated with you..."
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Who would you recommend this book to? *</label>
                  <textarea
                    name="recommendation"
                    value={formData.recommendation}
                    onChange={handleChange}
                    className="textarea"
                    rows="3"
                    required
                    placeholder="The type of reader who would benefit most from this book..."
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">What stood out most? *</label>
                  <textarea
                    name="standout"
                    value={formData.standout}
                    onChange={handleChange}
                    className="textarea"
                    rows="3"
                    required
                    placeholder="A specific moment, chapter, or aspect that impressed you..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Generating Your Review...' : 'Generate My Review'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 2 && review && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Step 2 of 2</span>
              </div>
            </div>

            <div className="card card-wide">
              <h2 className="heading-lg" style={{ textAlign: 'center' }}>Your Review is Ready</h2>
              <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Copy and paste this into Amazon
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="heading-md">
                    {showLong ? 'Long Review' : 'Short Review (Recommended)'}
                  </h3>
                  <button
                    onClick={() => setShowLong(!showLong)}
                    className="btn-text"
                  >
                    {showLong ? 'Show Short' : 'Show Long'}
                  </button>
                </div>
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  lineHeight: '1.7',
                  fontSize: '1rem'
                }}>
                  <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {showLong ? review.longReview : review.shortReview}
                  </p>
                </div>
              </div>

              <div className="btn-group" style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => handleCopy(showLong ? review.longReview : review.shortReview)}
                  className="btn btn-secondary"
                >
                  {copied ? 'Copied!' : 'Copy Review'}
                </button>

                <button
                  onClick={handleCopyAndOpenAmazon}
                  className="btn btn-primary"
                >
                  Copy + Open Amazon Review
                </button>
              </div>

              <div className="info-box">
                <p className="text-sm" style={{ marginBottom: '0.5rem' }}>
                  <strong>Next:</strong> Paste this into your Amazon review
                </p>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  You can edit the wording before posting. This is just a helpful starting point. Takes 30 seconds.
                </p>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                <p className="text-sm text-muted">
                  Thank you for supporting {author.author_name}!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
