import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { verifyPassword } from '../utils/passwordHash';

export default function MyFunnelsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [funnels, setFunnels] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (authorError) throw authorError;

      if (!authorData) {
        setError('No account found with this email');
        setLoading(false);
        return;
      }

      const isValid = await verifyPassword(password, authorData.password_hash);

      if (!isValid) {
        setError('Incorrect password');
        setLoading(false);
        return;
      }

      const { data: allFunnels, error: funnelsError } = await supabase
        .from('authors')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (funnelsError) throw funnelsError;

      setFunnels(allFunnels || []);
      setAuthenticated(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = (slug) => {
    const authKey = `dashboard_auth_${slug}`;
    sessionStorage.setItem(authKey, 'true');
    navigate(`/dashboard/${slug}`);
  };

  if (!authenticated) {
    return (
      <div className="app-container">
        <div className="app-content">
          <div className="card max-w-500">
            <div className="text-center mb-2">
              <h1 className="heading-xl">My Funnels</h1>
              <p className="text-muted">Access all your review funnels</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  placeholder="author@example.com"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Your password"
                />
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
                {loading ? 'Logging in...' : 'View My Funnels'}
              </button>
            </form>

            <div className="text-center mt-2">
              <button
                onClick={() => navigate('/')}
                className="btn-text"
              >
                Create New Funnel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-content max-w-1000">
        <div className="mb-2">
          <h1 className="heading-xl">My Review Funnels</h1>
          <p className="text-muted text-lg">Manage and access all your book review funnels</p>
        </div>

        <div className="grid gap-1.5">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="card hover-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="heading-lg mb-0.5">{funnel.book_title}</h3>
                  <p className="text-muted mb-1">by {funnel.author_name}</p>

                  <div className="flex flex-wrap gap-2 mb-1">
                    <div className="stat-pill">
                      <span className="stat-pill-label">Views:</span>
                      <span className="stat-pill-value">{funnel.view_count || 0}</span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-pill-label">Created:</span>
                      <span className="stat-pill-value">{new Date(funnel.created_at).toLocaleDateString()}</span>
                    </div>
                    {funnel.last_accessed_at && (
                      <div className="stat-pill">
                        <span className="stat-pill-label">Last accessed:</span>
                        <span className="stat-pill-value">{new Date(funnel.last_accessed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-0.5">
                    <a
                      href={`/review/${funnel.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-link"
                    >
                      /review/{funnel.slug}
                    </a>
                  </div>
                </div>

                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleAccessDashboard(funnel.slug)}
                    className="btn btn-primary"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/review/${funnel.slug}`);
                    }}
                    className="btn btn-secondary"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {funnels.length === 0 && (
          <div className="card text-center">
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p className="text-muted">No funnels found</p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary mt-1.5"
              >
                Create Your First Funnel
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-2">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Create New Funnel
          </button>
        </div>
      </div>
    </div>
  );
}
