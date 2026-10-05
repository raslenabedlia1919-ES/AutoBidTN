import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <main className="home">

      <section className="hero">

        <div className="hero-container">

          <h1>
            Find. Bid.
            <br />
            <span>Drive.</span>
          </h1>

          <p>
            Discover great cars, join live auctions,
            and bid on your next vehicle with AutoBid TN.
          </p>

          <div className="hero-buttons">

            <Link
              to="/cars"
              className="primary-button"
            >
              Browse Cars
            </Link>

            {!user && (
              <Link
                to="/register"
                className="secondary-button"
              >
                Create Account
              </Link>
            )}

          </div>

        </div>

      </section>

    </main>
  );
};

export default Home;