import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
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
      <div className="app-content" style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate(`/review/${slug}`)}
            className="btn-text"
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Public Page
          </button>
          <h1 className="heading-xl">{author.book_title}</h1>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>by {author.author_name}</p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="input"
              style={{ flex: 1, fontSize: '0.875rem' }}
            />
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="btn btn-secondary"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="stat-card">
            <div className="stat-value">{stats.totalAttempts}</div>
            <div className="stat-label">Total Readers Engaged</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.reviewsGenerated}</div>
            <div className="stat-label">Reviews Generated</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {generatedRate}% of total
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.copied}</div>
            <div className="stat-label">Reviews Copied</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {copiedRate}% conversion
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.clickedAmazon}</div>
            <div className="stat-label">Amazon Clicks</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {amazonClickRate}% clicked through
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: generatedRate >= 80 ? '#10b981' : generatedRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {generatedRate}%
            </div>
            <div className="stat-label">Generation Rate</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {generatedRate >= 80 ? '🟢 Strong' : generatedRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: copiedRate >= 80 ? '#10b981' : copiedRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {copiedRate}%
            </div>
            <div className="stat-label">Copy Rate</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {copiedRate >= 80 ? '🟢 Strong' : copiedRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: amazonClickRate >= 80 ? '#10b981' : amazonClickRate >= 50 ? '#f59e0b' : '#6b7280' }}>
              {amazonClickRate}%
            </div>
            <div className="stat-label">Amazon Click Rate</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {amazonClickRate >= 80 ? '🟢 Strong' : amazonClickRate >= 50 ? '🟡 Good' : '🔴 Needs work'}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="heading-lg" style={{ marginBottom: '1.5rem' }}>Recent Reader Submissions</h2>

          {stats.recentAttempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p className="text-muted">No submissions yet</p>
              <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                Share your public review page to start collecting reader feedback
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Email</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Takeaway</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Recommendation</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Generated</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Copied</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Amazon</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((attempt) => (
                    <tr key={attempt.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{attempt.email}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attempt.takeaway}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attempt.recommendation}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span className={`badge ${attempt.review_generated ? 'badge-success' : 'badge-default'}`}>
                          {attempt.review_generated ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span className={`badge ${attempt.copied ? 'badge-success' : 'badge-default'}`}>
                          {attempt.copied ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span className={`badge ${attempt.clicked_amazon ? 'badge-success' : 'badge-default'}`}>
                          {attempt.clicked_amazon ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </td>
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
