import { useEffect, useState } from 'react';
import { dashboardApi, tripApi } from '../services/apiService.js';
import DashboardView from '../components/DashboardView.jsx';
import { ErrorMessage, Spinner } from '../components/Feedback.jsx';

export default function DashboardPage() {
  const [trips, setTrips] = useState(null);
  const [tripId, setTripId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    tripApi
      .getAll()
      .then((list) => {
        setTrips(list);
        if (list.length) setTripId(String(list[0].id));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!tripId) return;
    setData(null);
    dashboardApi
      .forTrip(tripId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [tripId]);

  return (
    <>
      <h2>Dashboard</h2>
      <p className="muted">Totals for one trip, in DKK.</p>
      <ErrorMessage message={error} />
      {!trips && !error && <Spinner />}
      {trips && trips.length === 0 && <p className="muted">Create a trip to see its budget here.</p>}
      {trips && trips.length > 0 && (
        <>
          <label>
            Trip
            <select value={tripId} onChange={(e) => setTripId(e.target.value)}>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          {!data && !error && <Spinner />}
          {data && <DashboardView data={data} />}
        </>
      )}
    </>
  );
}
