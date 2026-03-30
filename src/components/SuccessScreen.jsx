export default function SuccessScreen() {
  return (
    <div className="card card-centered text-center">
      <h2 className="heading-lg">Thanks for supporting the author</h2>

      <p className="text-muted">
        Your review helps others discover this book and supports authors who create valuable content.
      </p>

      <div className="info-box">
        <p className="text-sm">
          <strong>Book:</strong> Scare to CARES
          <br />
          <strong>Author:</strong> Saby Waraich
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="btn-text"
        style={{ marginTop: '2rem' }}
      >
        Create another review
      </button>
    </div>
  );
}
