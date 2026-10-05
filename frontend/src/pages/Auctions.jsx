import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH AUCTIONS
  // =========================

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await api.get("/auctions");

        setAuctions(
          response.data.auctions || []
        );
      } catch (error) {
        console.error(
          "Error fetching auctions:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load auctions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // =========================
  // FORMAT TIME
  // =========================

  const formatTimeLeft = (endDate) => {
    const difference =
      new Date(endDate).getTime() -
      new Date().getTime();

    if (difference <= 0) {
      return "Auction ended";
    }

    const totalSeconds = Math.floor(
      difference / 1000
    );

    const days = Math.floor(
      totalSeconds / 86400
    );

    const hours = Math.floor(
      (totalSeconds % 86400) / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    return `${days}d ${hours}h ${minutes}m`;
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="auctions-page">
        <div className="auctions-container">
          <div className="loading">
            Loading auctions...
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="auctions-page">
        <div className="auctions-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="auctions-page">

      <div className="auctions-container">

        {/* =========================
            HEADER
        ========================= */}

        <section className="auctions-header">

          <div>

            <p className="section-label">
              AUTO BID TN
            </p>

            <h1>
              Auctions
            </h1>

            <p>
              Discover cars currently
              available for bidding.
            </p>

          </div>

          <div className="auctions-count">
            {auctions.length} auction
            {auctions.length !== 1
              ? "s"
              : ""}
          </div>

        </section>

        {/* =========================
            EMPTY
        ========================= */}

        {auctions.length === 0 ? (

          <div className="auctions-empty">

            <div className="empty-auction-icon">
              🔨
            </div>

            <h2>
              No auctions available
            </h2>

            <p>
              There are currently no
              auctions to display.
            </p>

            <Link
              to="/cars"
              className="primary-button"
            >
              Browse Cars
            </Link>

          </div>

        ) : (

          /* =========================
             AUCTION GRID
          ========================= */

          <div className="auctions-grid">

            {auctions.map((auction) => {

              const car = auction.car;

              return (
                <article
                  className="auction-card"
                  key={auction._id}
                >

                  {/* IMAGE */}

                  <div className="auction-image">

                    {car?.images &&
                    car.images.length > 0 ? (

                      <img
                        src={car.images[0]}
                        alt={
                          car.title ||
                          "Car"
                        }
                      />

                    ) : (

                      <div className="no-image">
                        🚗
                      </div>

                    )}

                    <span
                      className={`auction-card-status status-${auction.status}`}
                    >
                      {auction.status}
                    </span>

                  </div>

                  {/* CONTENT */}

                  <div className="auction-content">

                    <h2>
                      {car?.title ||
                        "Car Auction"}
                    </h2>

                    <p className="auction-location">
                      📍{" "}
                      {car?.location ||
                        "Unknown location"}
                    </p>

                    {/* INFO */}

                    <div className="auction-info">

                      <div>
                        <span>
                          Current Price
                        </span>

                        <strong>
                          {Number(
                            auction.currentPrice ||
                              0
                          ).toLocaleString()}{" "}
                          TND
                        </strong>
                      </div>

                      <div>
                        <span>
                          Starting Price
                        </span>

                        <strong>
                          {Number(
                            auction.startingPrice ||
                              0
                          ).toLocaleString()}{" "}
                          TND
                        </strong>
                      </div>

                    </div>

                    {/* TIME */}

                    {auction.status ===
                      "active" && (

                      <div className="auction-time">

                        <span>
                          ⏱ Ends in
                        </span>

                        <strong>
                          {formatTimeLeft(
                            auction.endDate
                          )}
                        </strong>

                      </div>
                    )}

                    {auction.status ===
                      "upcoming" && (

                      <div className="auction-time upcoming-time">

                        <span>
                          📅 Starts
                        </span>

                        <strong>
                          {new Date(
                            auction.startDate
                          ).toLocaleDateString()}
                        </strong>

                      </div>
                    )}

                    {auction.status ===
                      "ended" && (

                      <div className="auction-time ended-time">

                        <span>
                          🏁
                        </span>

                        <strong>
                          Auction ended
                        </strong>

                      </div>
                    )}

                    {/* BUTTON */}

                    {car?._id && (

                      <Link
                        to={`/cars/${car._id}`}
                        className="auction-view-button"
                      >
                        View Auction
                      </Link>

                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>

    </main>
  );
};

export default Auctions;