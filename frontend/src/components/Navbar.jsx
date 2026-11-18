import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  useLocation(); // re-render on navigation so auth state stays current
  const authed = Boolean(localStorage.getItem('token'));

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">My Trip Planner</span>
        {authed && (
          <nav className="nav-links">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/trips">Trips</NavLink>
            <button className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
