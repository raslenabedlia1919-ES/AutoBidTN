import {
  Link,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const {
    user,
    logout
  } = useAuth();

  const navigate =
    useNavigate();

  const handleLogout = () => {
    logout();

    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="navbar-container">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          to="/"
          className="logo"
        >

          <span className="logo-icon">
            🚗
          </span>

          <span>
            AutoBid
            <span className="logo-highlight">
              TN
            </span>
          </span>

        </Link>

        {/* =========================
            NAV LINKS
        ========================= */}

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/cars">
            Browse Cars
          </Link>

          <Link to="/auctions">
            Auctions
          </Link>

          {user && (
            <>
              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link to="/favorites">
                Favorites
              </Link>

              <Link to="/seller">
                Seller Area
              </Link>
            </>
          )}

        </div>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="nav-actions">

          {user ? (

            <>
              <span className="user-name">
                Hi, {user.name}
              </span>

              <button
                className="nav-button logout-button"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            </>

          ) : (

            <>

              <Link
                to="/login"
                className="login-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-button"
              >
                Create Account
              </Link>

            </>

          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;