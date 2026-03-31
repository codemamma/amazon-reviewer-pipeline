import { useState } from 'react';

export default function ReviewDisplay({ shortReview, longReview, onCopy, onNext, onAmazonLinkClick }) {
  const [copied, setCopied] = useState(false);
  const [showLong, setShowLong] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAndPost = async () => {
    await handleCopy(shortReview);
    setTimeout(() => {
      onNext();
    }, 500);
  };

  const handleAmazonLinkClick = () => {
    if (onAmazonLinkClick) {
      onAmazonLinkClick();
    }
  };

  return (
    <div className="card card-wide">
      <h2 className="heading-lg">Your Review is Ready</h2>
      <p className="text-muted">Copy and paste this into Amazon</p>

      <div>
        <div className="review-display-header">
          <h3 className="heading-md">
            {showLong ? 'Long Review' : 'Short Review'}
          </h3>
          <button
            onClick={() => setShowLong(!showLong)}
            className="btn-text"
          >
            {showLong ? 'Show Short' : 'Show Long'}
          </button>
        </div>
        <div className="review-display">
          <p className="review-text">
            {showLong ? longReview : shortReview}
          </p>
        </div>
      </div>

      <div className="btn-group">
        <button
          onClick={() => handleCopy(showLong ? longReview : shortReview)}
          className="btn btn-secondary"
        >
          {copied ? 'Copied!' : 'Copy Review'}
        </button>

        <button
          onClick={handleCopyAndPost}
          className="btn btn-primary"
        >
          Copy + Post Review
        </button>
      </div>

      <div className="info-box">
        <p className="text-sm" style={{ marginBottom: '0.5rem' }}>
          <strong>Next step:</strong> Paste this into your Amazon review
        </p>
        <a
          href="https://amazon.com/review/create-review"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm"
          onClick={handleAmazonLinkClick}
        >
          amazon.com/review/create-review
        </a>
        <p className="text-sm" style={{ marginTop: '0.5rem' }}>
          Takes 30 seconds
        </p>
      </div>
    </div>
  );
}
