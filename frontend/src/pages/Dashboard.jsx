import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // USER ID
  // =====================================================

  const userId = user?._id || user?.id;

  // =====================================================
  // PROTECT PAGE
  // =====================================================

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const config = {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        };

        const [
          bidsResponse,
          favoritesResponse
        ] = await Promise.all([
          api.get(
            "/bids/my-bids",
            config
          ),

          api.get(
            "/favorites/my-favorites",
            config
          )
        ]);

        setBids(
          bidsResponse.data.bids || []
        );

        setFavorites(
          favoritesResponse.data.favorites || []
        );

      } catch (error) {

        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load dashboard."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // =====================================================
  // GET LATEST BID FOR EACH AUCTION
  // =====================================================

  const latestBids = useMemo(() => {
    const map = new Map();

    const sortedBids = [...bids].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    sortedBids.forEach((bid) => {
      const auctionId =
        bid.auction?._id ||
        bid.auction;

      if (!auctionId) {
        return;
      }

      if (!map.has(auctionId)) {
        map.set(
          auctionId,
          bid
        );
      }
    });

    return Array.from(
      map.values()
    );
  }, [bids]);

  // =====================================================
  // BID STATUS
  // =====================================================

  const getBidStatus = (bid) => {
    const auction =
      bid.auction;

    if (!auction) {
      return {
        label: "Unknown",
        className: "status-ended"
      };
    }

    // AUCTION ENDED
    if (auction.status === "ended") {

      const winnerId =
        auction.winner?._id ||
        auction.winner;

      if (
        winnerId &&
        String(winnerId) ===
          String(userId)
      ) {
        return {
          label: "🏆 Won",
          className: "status-won"
        };
      }

      return {
        label: "Lost",
        className: "status-lost"
      };
    }

    // AUCTION ACTIVE
    if (auction.status === "active") {

      const currentPrice =
        Number(
          auction.currentPrice || 0
        );

      const myBid =
        Number(
          bid.amount || 0
        );

      if (myBid >= currentPrice) {
        return {
          label: "🟢 Leading",
          className: "status-leading"
        };
      }

      return {
        label: "🔴 Outbid",
        className: "status-outbid"
      };
    }

    // UPCOMING
    return {
      label: "Upcoming",
      className: "status-upcoming"
    };
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const activeBids =
    latestBids.filter(
      (bid) =>
        bid.auction?.status === "active"
    );

  const endedBids =
    latestBids.filter(
      (bid) =>
        bid.auction?.status === "ended"
    );

  const wonBids =
    endedBids.filter((bid) => {
      const winnerId =
        bid.auction?.winner?._id ||
        bid.auction?.winner;

      return (
        winnerId &&
        String(winnerId) ===
          String(userId)
      );
    });

  const lostBids =
    endedBids.filter((bid) => {
      const winnerId =
        bid.auction?.winner?._id ||
        bid.auction?.winner;

      return (
        winnerId &&
        String(winnerId) !==
          String(userId)
      );
    });

  // =====================================================
  // LOADING
  // =====================================================

  if (authLoading || loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="dashboard-header">

          <div>

            <p className="section-label">
              AUTO BID TN
            </p>

            <h1>
              Welcome, {user?.name}
            </h1>

            <p>
              Track your auctions,
              bids and favorite cars.
            </p>

          </div>

          <div className="dashboard-user">

            <div className="dashboard-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div>

              <strong>
                {user?.name}
              </strong>

              <span>
                {user?.email}
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              🔨
            </div>

            <div>

              <span>
                Total Bids
              </span>

              <strong>
                {bids.length}
              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-icon">
              ⚡
            </div>

            <div>

              <span>
                Active Auctions
              </span>

              <strong>
                {activeBids.length}
              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-icon">
              🏆
            </div>

            <div>

              <span>
                Won Auctions
              </span>

              <strong>
                {wonBids.length}
              </strong>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-icon">
              ❤️
            </div>

            <div>

              <span>
                Favorites
              </span>

              <strong>
                {favorites.length}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section className="dashboard-columns">


          {/* =================================================
              MY BIDS
          ================================================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <div>

                <h2>
                  My Bids
                </h2>

                <p>
                  Your latest activity
                  on auctions.
                </p>

              </div>

              <span>
                {latestBids.length}
              </span>

            </div>


            {latestBids.length === 0 ? (

              <div className="dashboard-empty">

                <div>
                  🔨
                </div>

                <h3>
                  No bids yet
                </h3>

                <p>
                  Start bidding on cars
                  you like.
                </p>

                <Link
                  to="/cars"
                  className="primary-button"
                >
                  Browse Cars
                </Link>

              </div>

            ) : (

              <div className="dashboard-list">

                {latestBids
                  .slice(0, 8)
                  .map((bid) => {

                    const auction =
                      bid.auction;

                    const car =
                      auction?.car;

                    const status =
                      getBidStatus(bid);

                    return (

                      <div
                        className="dashboard-bid-item"
                        key={bid._id}
                      >

                        {/* IMAGE */}

                        <div className="dashboard-item-image">

                          {car?.images &&
                          car.images.length > 0 ? (

                            <img
                              src={
                                car.images[0]
                              }
                              alt={
                                car.title ||
                                "Car"
                              }
                            />

                          ) : (

                            <span>
                              🚗
                            </span>

                          )}

                        </div>


                        {/* INFORMATION */}

                        <div className="dashboard-item-info">

                          <strong>
                            {car?.title ||
                              "Car"}
                          </strong>

                          <span>
                            Your bid:{" "}
                            {Number(
                              bid.amount || 0
                            ).toLocaleString()}{" "}
                            TND
                          </span>

                          {auction?.status ===
                            "active" && (
                            <small>
                              Current price:{" "}
                              {Number(
                                auction.currentPrice ||
                                  0
                              ).toLocaleString()}{" "}
                              TND
                            </small>
                          )}

                          {auction?.status ===
                            "ended" && (
                            <small>
                              Final price:{" "}
                              {Number(
                                auction.currentPrice ||
                                  0
                              ).toLocaleString()}{" "}
                              TND
                            </small>
                          )}

                        </div>


                        {/* STATUS */}

                        <div className="dashboard-item-right">

                          <span
                            className={`dashboard-status ${status.className}`}
                          >
                            {status.label}
                          </span>

                          {car?._id && (

                            <Link
                              to={`/cars/${car._id}`}
                              className="small-link"
                            >
                              View
                            </Link>

                          )}

                        </div>

                      </div>

                    );
                  })}

              </div>

            )}

          </div>


          {/* =================================================
              MY WINS
          ================================================= */}

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <div>

                <h2>
                  My Wins
                </h2>

                <p>
                  Auctions you won.
                </p>

              </div>

              <span>
                {wonBids.length}
              </span>

            </div>


            {wonBids.length === 0 ? (

              <div className="dashboard-empty">

                <div>
                  🏆
                </div>

                <h3>
                  No wins yet
                </h3>

                <p>
                  Keep bidding to win
                  your next auction.
                </p>

                <Link
                  to="/auctions"
                  className="primary-button"
                >
                  View Auctions
                </Link>

              </div>

            ) : (

              <div className="dashboard-list">

                {wonBids
                  .slice(0, 5)
                  .map((bid) => {

                    const car =
                      bid.auction?.car;

                    if (!car) {
                      return null;
                    }

                    return (

                      <div
                        className="dashboard-bid-item"
                        key={bid._id}
                      >

                        <div className="dashboard-item-image">

                          {car.images &&
                          car.images.length > 0 ? (

                            <img
                              src={
                                car.images[0]
                              }
                              alt={
                                car.title ||
                                "Car"
                              }
                            />

                          ) : (

                            <span>
                              🚗
                            </span>

                          )}

                        </div>

                        <div className="dashboard-item-info">

                          <strong>
                            {car.title}
                          </strong>

                          <span>
                            Winning bid:{" "}
                            {Number(
                              bid.auction
                                ?.currentPrice ||
                                bid.amount ||
                                0
                            ).toLocaleString()}{" "}
                            TND
                          </span>

                        </div>

                        <div className="dashboard-item-right">

                          <span className="dashboard-status status-won">
                            🏆 Won
                          </span>

                          <Link
                            to={`/cars/${car._id}`}
                            className="small-link"
                          >
                            View
                          </Link>

                        </div>

                      </div>

                    );
                  })}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            FAVORITES
        ================================================= */}

        <section className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                My Favorites
              </h2>

              <p>
                Cars you saved.
              </p>

            </div>

            <Link
              to="/favorites"
              className="small-link"
            >
              View All
            </Link>

          </div>


          {favorites.length === 0 ? (

            <div className="dashboard-empty">

              <div>
                ♡
              </div>

              <h3>
                No favorites
              </h3>

              <p>
                Save cars you want to
                watch later.
              </p>

              <Link
                to="/cars"
                className="primary-button"
              >
                Browse Cars
              </Link>

            </div>

          ) : (

            <div className="dashboard-favorites">

              {favorites
                .slice(0, 4)
                .map((favorite) => {

                  const car =
                    favorite.car;

                  if (!car) {
                    return null;
                  }

                  return (

                    <Link
                      to={`/cars/${car._id}`}
                      className="dashboard-favorite-item"
                      key={favorite._id}
                    >

                      <div className="dashboard-favorite-image">

                        {car.images &&
                        car.images.length > 0 ? (

                          <img
                            src={
                              car.images[0]
                            }
                            alt={
                              car.title
                            }
                          />

                        ) : (

                          <span>
                            🚗
                          </span>

                        )}

                      </div>

                      <div>

                        <strong>
                          {car.title}
                        </strong>

                        <span>
                          {car.year} •{" "}
                          {car.location}
                        </span>

                      </div>

                    </Link>

                  );

                })}

            </div>

          )}

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="quick-actions">

          <Link
            to="/cars"
            className="quick-action"
          >

            <span>
              🚗
            </span>

            <div>

              <strong>
                Browse Cars
              </strong>

              <p>
                Find your next car.
              </p>

            </div>

          </Link>


          <Link
            to="/auctions"
            className="quick-action"
          >

            <span>
              🔨
            </span>

            <div>

              <strong>
                View Auctions
              </strong>

              <p>
                Discover active auctions.
              </p>

            </div>

          </Link>


          <Link
            to="/sell-car"
            className="quick-action"
          >

            <span>
              🚘
            </span>

            <div>

              <strong>
                Sell a Car
              </strong>

              <p>
                Create your car listing.
              </p>

            </div>

          </Link>


          <Link
            to="/favorites"
            className="quick-action"
          >

            <span>
              ❤️
            </span>

            <div>

              <strong>
                My Favorites
              </strong>

              <p>
                See your saved cars.
              </p>

            </div>

          </Link>

        </section>

      </div>

    </main>
  );
};

export default Dashboard;