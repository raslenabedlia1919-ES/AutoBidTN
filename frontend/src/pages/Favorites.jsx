import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const Favorites = () => {

  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================
  // FETCH FAVORITES
  // =========================

  const fetchFavorites = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/favorites/my-favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFavorites(
        response.data.favorites || []
      );

    } catch (error) {

      console.error(
        "Error fetching favorites:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load favorites."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // =========================
  // REMOVE FAVORITE
  // =========================

  const removeFavorite = async (
    favoriteId
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      await api.delete(
        `/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite._id !== favoriteId
        )
      );

    } catch (error) {

      console.error(
        "Remove favorite error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to remove favorite."
      );

    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="favorites-page">

        <div className="favorites-container">

          <div className="loading">
            Loading favorites...
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
      <div className="favorites-page">

        <div className="favorites-container">

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
    <main className="favorites-page">

      <div className="favorites-container">

        <div className="favorites-header">

          <div>

            <p className="section-label">
              AUTO BID TN
            </p>

            <h1>
              My Favorites
            </h1>

            <p>
              Cars you saved to your watchlist.
            </p>

          </div>

          <span className="favorites-count">
            {favorites.length} saved
          </span>

        </div>

        {favorites.length === 0 ? (

          <div className="favorites-empty">

            <div className="empty-heart">
              ♡
            </div>

            <h2>
              No favorites yet
            </h2>

            <p>
              Save cars you are interested in
              and find them here later.
            </p>

            <Link
              to="/cars"
              className="primary-button"
            >
              Browse Cars
            </Link>

          </div>

        ) : (

          <div className="favorites-grid">

            {favorites.map(
              (favorite) => {

                const car = favorite.car;

                if (!car) {
                  return null;
                }

                return (

                  <article
                    className="favorite-card"
                    key={favorite._id}
                  >

                    <div className="favorite-image">

                      {car.images &&
                      car.images.length > 0 ? (

                        <img
                          src={car.images[0]}
                          alt={car.title}
                        />

                      ) : (

                        <div className="no-image">
                          🚗
                        </div>

                      )}

                    </div>

                    <div className="favorite-content">

                      <div className="favorite-title-row">

                        <div>

                          <h2>
                            {car.title}
                          </h2>

                          <p>
                            📍 {car.location}
                          </p>

                        </div>

                        <button
                          className="remove-favorite"
                          onClick={() =>
                            removeFavorite(
                              favorite._id
                            )
                          }
                          title="Remove favorite"
                        >
                          ♥
                        </button>

                      </div>

                      <div className="favorite-info">

                        <span>
                          {car.year}
                        </span>

                        <span>
                          {car.mileage.toLocaleString()} km
                        </span>

                        <span>
                          {car.fuelType}
                        </span>

                        <span>
                          {car.transmission}
                        </span>

                      </div>

                      <div className="favorite-footer">

                        <Link
                          to={`/cars/${car._id}`}
                          className="view-button"
                        >
                          View Details
                        </Link>

                      </div>

                    </div>

                  </article>

                );
              }
            )}

          </div>

        )}

      </div>

    </main>
  );
};

export default Favorites;