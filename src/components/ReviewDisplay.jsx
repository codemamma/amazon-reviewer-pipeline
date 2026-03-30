import { useState } from 'react';

export default function ReviewDisplay({ shortReview, longReview, onCopy, onNext }) {
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Review is Ready
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Copy and paste this into Amazon
        </p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {showLong ? 'Long Review' : 'Short Review'}
            </h3>
            <button
              onClick={() => setShowLong(!showLong)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showLong ? 'Show Short' : 'Show Long'}
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {showLong ? longReview : shortReview}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleCopy(showLong ? longReview : shortReview)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {copied ? 'Copied!' : 'Copy Review'}
          </button>

          <button
            onClick={handleCopyAndPost}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Copy + Post Review
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Next step:</strong> Paste this into your Amazon review
          </p>
          <a
            href="https://amazon.com/review/create-review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            amazon.com/review/create-review
          </a>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Takes 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
