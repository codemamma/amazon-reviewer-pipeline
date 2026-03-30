import { useState } from 'react';

export default function EmailCapture({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onNext(email);
  };

  return (
    <div className="card card-centered">
      <h1 className="heading-xl">Review Assistant</h1>
      <p className="text-muted">Generate an Amazon-ready review in minutes</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="form-input"
            placeholder="your@email.com"
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <button type="submit" className="btn btn-primary">
          Start
        </button>
      </form>

      <div className="divider">
        <p className="text-sm">
          For: <span className="book-info">Scare to CARES</span> by Saby Waraich
        </p>
      </div>
    </div>
  );
}
