import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dashboardApi, itemApi, tripApi } from '../services/apiService.js';
import DashboardView from '../components/DashboardView.jsx';
import { ErrorMessage, Spinner, SuccessMessage } from '../components/Feedback.jsx';
import { CATEGORIES, formatDKK } from '../components/format.js';

const EMPTY_ITEM = { category: CATEGORIES[0], amount: '', description: '', date: '' };

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [tripForm, setTripForm] = useState(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, i, d] = await Promise.all([
        tripApi.getById(tripId),
        itemApi.getAll(tripId),
        dashboardApi.forTrip(tripId),
      ]);
      setTrip(t);
      setItems(i);
      setDashboard(d);
    } catch (err) {
      setError(err.message);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setForm(EMPTY_ITEM);
    setEditingId(null);
  }

  async function onSaveItem(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const payload = {
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      ...(form.date && { date: form.date }),
    };
    try {
      if (editingId) {
        await itemApi.update(tripId, editingId, payload);
        setSuccess('Budget item updated.');
      } else {
        await itemApi.create(tripId, payload);
        setSuccess('Budget item added.');
      }
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({ category: item.category, amount: item.amount, description: item.description, date: item.date });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDeleteItem(item) {
    if (!window.confirm(`Delete this ${item.category} item (${formatDKK(item.amount)})?`)) return;
    setError('');
    setSuccess('');
    try {
      await itemApi.delete(tripId, item.id);
      setSuccess('Budget item deleted.');
      if (editingId === item.id) reset();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSaveTrip(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await tripApi.update(tripId, tripForm);
      setTripForm(null);
      setSuccess('Trip updated.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDeleteTrip() {
    if (!window.confirm(`Delete "${trip.title}" and all its budget items?`)) return;
    try {
      await tripApi.delete(tripId);
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!trip) {
    return (
      <>
        <Link to="/trips">&larr; Trips</Link>
        <ErrorMessage message={error} />
        {!error && <Spinner />}
      </>
    );
  }

  return (
    <>
      <Link to="/trips">&larr; Trips</Link>
      <div className="row">
        <div>
          <h2>{trip.title}</h2>
          <p className="muted">
            {trip.startDate} to {trip.endDate}
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-ghost"
            onClick={() =>
              setTripForm(
                tripForm
                  ? null
                  : { cityFrom: trip.cityFrom, cityTo: trip.cityTo, startDate: trip.startDate, endDate: trip.endDate }
              )
            }
          >
            {tripForm ? 'Cancel' : 'Edit trip'}
          </button>
          <button className="btn btn-danger" onClick={onDeleteTrip}>
            Delete trip
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {tripForm && (
        <form className="card form-inline" onSubmit={onSaveTrip}>
          <label>
            From
            <input required value={tripForm.cityFrom} onChange={(e) => setTripForm({ ...tripForm, cityFrom: e.target.value })} />
          </label>
          <label>
            To
            <input required value={tripForm.cityTo} onChange={(e) => setTripForm({ ...tripForm, cityTo: e.target.value })} />
          </label>
          <label>
            Start date
            <input type="date" required value={tripForm.startDate} onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })} />
          </label>
          <label>
            End date
            <input type="date" required value={tripForm.endDate} onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })} />
          </label>
          <button className="btn">Save trip</button>
        </form>
      )}

      {dashboard && <DashboardView data={dashboard} />}

      <h3>Budget items</h3>
      <form className="card form-inline" onSubmit={onSaveItem}>
        <label>
          Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Amount (DKK)
          <input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </label>
        <label>
          Date
          <input
            type="date"
            min={trip.startDate}
            max={trip.endDate}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="grow">
          Description (optional)
          <input maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <button className="btn" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update item' : 'Add item'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-ghost" onClick={reset}>
            Cancel
          </button>
        )}
      </form>

      {!items && <Spinner />}
      {items && items.length === 0 && <p className="muted">No budget items yet. Add one above.</p>}
      {items && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="num">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...items]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.category}</td>
                    <td>{item.description || <span className="muted">-</span>}</td>
                    <td className="num">{formatDKK(item.amount)}</td>
                    <td className="actions">
                      <button className="btn btn-ghost" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => onDeleteItem(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
