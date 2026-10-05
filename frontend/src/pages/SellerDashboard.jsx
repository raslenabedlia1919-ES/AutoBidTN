import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [auctions, setAuctions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // PROTECT PAGE
  // =====================================================

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // =====================================================
  // FETCH SELLER DATA
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchSellerData = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const config = {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        };

        const [
          carsResponse,
          auctionsResponse
        ] = await Promise.all([
          api.get(
            "/cars/my-cars",
            config
          ),
          api.get(
            "/auctions",
            config
          )
        ]);

        setCars(
          carsResponse.data.cars || []
        );

        /*
         * Keep only auctions belonging
         * to this seller.
         *
         * This assumes the auction endpoint
         * returns the car's seller.
         */
        const allAuctions =
          auctionsResponse.data.auctions ||
          [];

        const myAuctions =
          allAuctions.filter((auction) => {

            const seller =
              auction.car?.seller;

            const sellerId =
              seller?._id || seller;

            return (
              sellerId === user.id
            );
          });

        setAuctions(myAuctions);

      } catch (error) {
        console.error(
          "Seller dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load seller dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();

  }, [user]);

  // =====================================================
  // DELETE CAR
  // =====================================================

  const handleDeleteCar = async (
    carId
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) {
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      await api.delete(
        `/cars/${carId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setCars((current) =>
        current.filter(
          (car) =>
            car._id !== carId
        )
      );

    } catch (error) {

      console.error(
        "Delete car error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete car."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (authLoading || loading) {
    return (
      <div className="seller-page">
        <div className="seller-container">
          <div className="loading">
            Loading seller dashboard...
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
      <div className="seller-page">
        <div className="seller-container">

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
    <main className="seller-page">

      <div className="seller-container">

        {/* =========================
            HEADER
        ========================= */}

        <section className="seller-header">

          <div>

            <p className="section-label">
              SELLER AREA
            </p>

            <h1>
              My Listings
            </h1>

            <p>
              Manage your cars and auctions.
            </p>

          </div>

          <Link
            to="/sell-car"
            className="primary-button"
          >
            + Add Car
          </Link>

        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="seller-stats">

          <div className="seller-stat">

            <span>
              My Cars
            </span>

            <strong>
              {cars.length}
            </strong>

          </div>

          <div className="seller-stat">

            <span>
              My Auctions
            </span>

            <strong>
              {auctions.length}
            </strong>

          </div>

          <div className="seller-stat">

            <span>
              Active Auctions
            </span>

            <strong>
              {
                auctions.filter(
                  (auction) =>
                    auction.status ===
                    "active"
                ).length
              }
            </strong>

          </div>

        </section>

        {/* =========================
            MY CARS
        ========================= */}

        <section className="seller-section">

          <div className="seller-section-header">

            <div>

              <h2>
                My Cars
              </h2>

              <p>
                Vehicles you have listed.
              </p>

            </div>

          </div>

          {cars.length === 0 ? (

            <div className="seller-empty">

              <div>
                🚗
              </div>

              <h3>
                No cars yet
              </h3>

              <p>
                Create your first car
                listing.
              </p>

              <Link
                to="/sell-car"
                className="primary-button"
              >
                Add Your First Car
              </Link>

            </div>

          ) : (

            <div className="seller-cars-grid">

              {cars.map((car) => {

                const auction =
                  auctions.find(
                    (item) =>
                      item.car?._id ===
                      car._id
                  );

                return (
                  <article
                    className="seller-car-card"
                    key={car._id}
                  >

                    {/* IMAGE */}

                    <div className="seller-car-image">

                      {car.images &&
                      car.images.length > 0 ? (

                        <img
                          src={car.images[0]}
                          alt={
                            car.title
                          }
                        />

                      ) : (

                        <div className="no-image">
                          🚗
                        </div>

                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="seller-car-content">

                      <h3>
                        {car.title}
                      </h3>

                      <p>
                        📍{" "}
                        {car.location ||
                          "No location"}
                      </p>

                      <div className="seller-car-info">

                        <span>
                          {car.year}
                        </span>

                        <span>
                          {Number(
                            car.mileage || 0
                          ).toLocaleString()} km
                        </span>

                        <span>
                          {car.fuelType}
                        </span>

                      </div>

                      {/* AUCTION STATUS */}

                      {auction ? (

                        <div className="seller-auction-status">

                          <span>
                            Auction
                          </span>

                          <strong
                            className={`seller-status status-${auction.status}`}
                          >
                            {auction.status}
                          </strong>

                        </div>

                      ) : (

                        <div className="seller-no-auction">
                          No auction
                        </div>

                      )}

                      {/* ACTIONS */}

                      <div className="seller-card-actions">

                        <Link
                          to={`/cars/${car._id}`}
                          className="seller-view-button"
                        >
                          View
                        </Link>

                        {!auction && (

                          <Link
                            to="/create-auction"
                            className="seller-auction-button"
                          >
                            Create Auction
                          </Link>

                        )}

                        <button
                          type="button"
                          className="seller-delete-button"
                          onClick={() =>
                            handleDeleteCar(
                              car._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* =========================
            MY AUCTIONS
        ========================= */}

        <section className="seller-section">

          <div className="seller-section-header">

            <div>

              <h2>
                My Auctions
              </h2>

              <p>
                Auctions linked to your cars.
              </p>

            </div>

            <Link
              to="/auctions"
              className="small-link"
            >
              View All Auctions
            </Link>

          </div>

          {auctions.length === 0 ? (

            <div className="seller-empty small-empty">

              <div>
                🔨
              </div>

              <h3>
                No auctions yet
              </h3>

              <p>
                Create an auction for one
                of your cars.
              </p>

              <Link
                to="/create-auction"
                className="primary-button"
              >
                Create Auction
              </Link>

            </div>

          ) : (

            <div className="seller-auctions-list">

              {auctions.map(
                (auction) => (

                  <div
                    className="seller-auction-row"
                    key={auction._id}
                  >

                    <div>

                      <strong>
                        {auction.car?.title ||
                          "Car"}
                      </strong>

                      <span>
                        Current price:{" "}
                        {Number(
                          auction.currentPrice ||
                            0
                        ).toLocaleString()}{" "}
                        TND
                      </span>

                    </div>

                    <div className="seller-auction-right">

                      <span
                        className={`seller-status status-${auction.status}`}
                      >
                        {auction.status}
                      </span>

                      {auction.car?._id && (
                        <Link
                          to={`/cars/${auction.car._id}`}
                          className="small-link"
                        >
                          View
                        </Link>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
};

export default SellerDashboard;