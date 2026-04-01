import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { verifyPassword } from '../utils/passwordHash';

export default function AuthorDashboardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    reviewsGenerated: 0,
    copied: 0,
    clickedAmazon: 0,
    recentAttempts: []
  });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    try {
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (authorError) throw authorError;

      if (!authorData) {
        setAuthor(null);
        setLoading(false);
        return;
      }

      setAuthor(authorData);

      const authKey = `dashboard_auth_${slug}`;
      const savedAuth = sessionStorage.getItem(authKey);

      if (savedAuth) {
        setAuthenticated(true);
        fetchData(authorData);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyPassword(password, author.password_hash);

      if (isValid) {
        const authKey = `dashboard_auth_${slug}`;
        sessionStorage.setItem(authKey, 'true');
        setAuthenticated(true);
        await fetchData(author);
      } else {
        setError('Incorrect password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const fetchData = async (authorData) => {
    try {
      await supabase
        .from('authors')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', authorData.id);

      const { data: attempts, error: attemptsError } = await supabase
        .from('review_attempts')
        .select('*')
        .eq('author_id', authorData.id)
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      const totalAttempts = attempts?.length || 0;
      const reviewsGenerated = attempts?.filter(a => a.review_generated).length || 0;
      const copied = attempts?.filter(a => a.copied).length || 0;
      const clickedAmazon = attempts?.filter(a => a.clicked_amazon).length || 0;

      setStats({
        totalAttempts,
        reviewsGenerated,
        copied,
        clickedAmazon,
        recentAttempts: attempts?.slice(0, 20) || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
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
            <h1 className="heading-lg">Dashboard Not Found</h1>
            <p className="text-muted">This author page does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="app-container">
        <div className="app-content">
          <div className="card max-w-500">
            <div className="text-center mb-2">
              <h1 className="heading-xl">Dashboard Login</h1>
              <p className="text-muted">{author.book_title}</p>
              <p className="text-sm text-muted">by {author.author_name}</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Enter your dashboard password"
                  autoFocus
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
              >
                Access Dashboard
              </button>
            </form>

            <div className="text-center mt-2">
              <button
                onClick={() => navigate('/my-funnels')}
                className="btn-text"
              >
                View All My Funnels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const generatedRate = stats.totalAttempts > 0
    ? Math.round((stats.reviewsGenerated / stats.totalAttempts) * 100)
    : 0;

  const copiedRate = stats.reviewsGenerated > 0
    ? Math.round((stats.copied / stats.reviewsGenerated) * 100)
    : 0;

  const amazonClickRate = stats.reviewsGenerated > 0
    ? Math.round((stats.clickedAmazon / stats.reviewsGenerated) * 100)
    : 0;

  const publicUrl = `${window.location.origin}/review/${slug}`;

  return (
    <div className="app-container">
      <div className="app-content max-w-1200">
        <div className="mb-2">
          <button
            onClick={() => navigate(`/review/${slug}`)}
            className="btn-text mb-1.5"
          >
            ← Back to Public Page
          </button>
          <h1 className="heading-xl">{author.book_title}</h1>
          <p className="text-muted text-lg">by {author.author_name}</p>

          <div className="flex gap-1 items-center mt-1">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="form-input text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="btn btn-secondary"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div className="stats-grid mb-2">
          <div className="stat-card">
            <div className="stat-value">{stats.totalAttempts}</div>
            <div className="stat-label">Total Readers Engaged</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.reviewsGenerated}</div>
            <div className="stat-label">Reviews Generated</div>
            <div className="stat-sublabel">
              {generatedRate}% of total
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.copied}</div>
            <div className="stat-label">Reviews Copied</div>
            <div className="stat-sublabel">
              {copiedRate}% conversion
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.clickedAmazon}</div>
            <div className="stat-label">Amazon Clicks</div>
            <div className="stat-sublabel">
              {amazonClickRate}% clicked through
            </div>
          </div>
        </div>

        <div className="metrics-grid mb-2">
          <div className="card text-center">
            <div className="metric-value" style={{ color: generatedRate >= 80 ? '#10b981' : generatedRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {generatedRate}%
            </div>
            <div className="stat-label">Generation Rate</div>
            <div className="metric-status">
              {generatedRate >= 80 ? '🟢 Strong' : generatedRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>

          <div className="card text-center">
            <div className="metric-value" style={{ color: copiedRate >= 80 ? '#10b981' : copiedRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {copiedRate}%
            </div>
            <div className="stat-label">Copy Rate</div>
            <div className="metric-status">
              {copiedRate >= 80 ? '🟢 Strong' : copiedRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>

          <div className="card text-center">
            <div className="metric-value" style={{ color: amazonClickRate >= 80 ? '#10b981' : amazonClickRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {amazonClickRate}%
            </div>
            <div className="stat-label">Amazon Click Rate</div>
            <div className="metric-status">
              {amazonClickRate >= 80 ? '🟢 Strong' : amazonClickRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="heading-lg mb-1.5">Recent Reader Submissions</h2>

          {stats.recentAttempts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p className="text-muted">No submissions yet</p>
              <p className="text-sm text-muted mt-0.5">
                Share your public review page to start collecting reader feedback
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Takeaway</th>
                    <th>Recommendation</th>
                    <th className="text-center">Generated</th>
                    <th className="text-center">Copied</th>
                    <th className="text-center">Amazon</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td>{attempt.email}</td>
                      <td className="table-truncate">{attempt.takeaway}</td>
                      <td className="table-truncate">{attempt.recommendation}</td>
                      <td className="text-center">
                        <span className={`badge ${attempt.review_generated ? 'badge-success' : 'badge-default'}`}>
                          {attempt.review_generated ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${attempt.copied ? 'badge-success' : 'badge-default'}`}>
                          {attempt.copied ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${attempt.clicked_amazon ? 'badge-success' : 'badge-default'}`}>
                          {attempt.clicked_amazon ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{new Date(attempt.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
