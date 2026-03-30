export default function SuccessScreen() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Thanks for supporting the author
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Your review helps others discover this book and supports authors who create valuable content.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Book:</strong> Scare to CARES
            <br />
            <strong>Author:</strong> Saby Waraich
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          Create another review
        </button>
      </div>
    </div>
  );
}
