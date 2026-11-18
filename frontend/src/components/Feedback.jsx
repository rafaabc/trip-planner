export function Spinner({ label = 'Loading...' }) {
  return <p className="muted">{label}</p>;
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <p className="alert alert-error" role="alert">
      {message}
    </p>
  );
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <p className="alert alert-success" role="status">
      {message}
    </p>
  );
}
