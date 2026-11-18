import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripApi } from '../services/apiService.js';
import { ErrorMessage, Spinner, SuccessMessage } from '../components/Feedback.jsx';

const EMPTY = { cityFrom: '', cityTo: '', startDate: '', endDate: '' };

export default function TripsPage() {
  const [trips, setTrips] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setTrips(await tripApi.getAll());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const trip = await tripApi.create(form);
      setForm(EMPTY);
      setSuccess(`Created "${trip.title}".`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(trip) {
    if (!window.confirm(`Delete "${trip.title}" and all its budget items?`)) return;
    setError('');
    setSuccess('');
    try {
      await tripApi.delete(trip.id);
      setSuccess(`Deleted "${trip.title}".`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h2>Trips</h2>
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <form className="card form-inline" onSubmit={onCreate}>
        <h3>New trip</h3>
        <label>
          From
          <input required value={form.cityFrom} onChange={(e) => setForm({ ...form, cityFrom: e.target.value })} />
        </label>
        <label>
          To
          <input required value={form.cityTo} onChange={(e) => setForm({ ...form, cityTo: e.target.value })} />
        </label>
        <label>
          Start date
          <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </label>
        <label>
          End date
          <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </label>
        <button className="btn" disabled={saving}>
          {saving ? 'Creating...' : 'Create trip'}
        </button>
      </form>

      {!trips && !error && <Spinner />}
      {trips && trips.length === 0 && <p className="muted">No trips yet. Create your first one above.</p>}
      <ul className="list">
        {(trips || []).map((trip) => (
          <li key={trip.id} className="card row">
            <div>
              <Link to={`/trips/${trip.id}`}>
                <strong>{trip.title}</strong>
              </Link>
              <div className="muted">
                {trip.startDate} to {trip.endDate}
              </div>
            </div>
            <div className="actions">
              <Link className="btn btn-ghost" to={`/trips/${trip.id}`}>
                Open
              </Link>
              <button className="btn btn-danger" onClick={() => onDelete(trip)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
