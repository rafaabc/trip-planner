import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/apiService.js';
import DashboardView from '../components/DashboardView.jsx';
import { ErrorMessage, Spinner } from '../components/Feedback.jsx';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .overall()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <h2>Dashboard</h2>
      <p className="muted">Totals across all your trips, in DKK.</p>
      <ErrorMessage message={error} />
      {!data && !error && <Spinner />}
      {data && (data.tripCount === 0 ? <p className="muted">Create a trip to see your budget here.</p> : <DashboardView data={data} />)}
    </>
  );
}
