import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalReviews: 0,
    copiedReviews: 0,
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: reviews, error } = await supabase
        .from('review_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalReviews = reviews?.filter(r => r.review_generated).length || 0;
      const copiedReviews = reviews?.filter(r => r.copied).length || 0;
      const recentReviews = reviews?.slice(0, 10) || [];

      setStats({
        totalReviews,
        copiedReviews,
        recentReviews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const conversionRate = stats.totalReviews > 0
    ? Math.round((stats.copiedReviews / stats.totalReviews) * 100)
    : 0;

  if (loading) {
    return (
      <div className="card card-wide">
        <h1 className="heading-lg">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="heading-xl">Author Dashboard</h1>
        <p className="text-muted">Track review generation and posting analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalReviews}</div>
          <div className="stat-label">Reviews Generated</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.copiedReviews}</div>
          <div className="stat-label">Reviews Copied</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{conversionRate}%</div>
          <div className="stat-label">Copy Rate</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="heading-lg">Recent Reviews</h2>

        {stats.recentReviews.length === 0 ? (
          <p className="text-muted">No reviews generated yet</p>
        ) : (
          <div className="reviews-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Generated</th>
                  <th>Copied</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.email}</td>
                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${review.review_generated ? 'badge-success' : 'badge-default'}`}>
                        {review.review_generated ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${review.copied ? 'badge-success' : 'badge-default'}`}>
                        {review.copied ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
