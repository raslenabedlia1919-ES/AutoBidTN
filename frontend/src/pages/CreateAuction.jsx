import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateAuction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);

  const [loadingCars, setLoadingCars] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formData, setFormData] =
    useState({
      car: "",
      startingPrice: "",
      startDate: "",
      endDate: ""
    });

  // ==========================================
  // FETCH USER'S CARS
  // ==========================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchCars = async () => {
      try {
        const response = await api.get("/cars");

        const allCars =
          response.data.cars || [];

        const myCars = allCars.filter((car) => {
          const sellerId =
            car.seller?._id ||
            car.seller;

          return (
            String(sellerId) ===
            String(user.id)
          );
        });

        setCars(myCars);

      } catch (error) {

        console.error(
          "Error fetching cars:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load your cars."
        );

      } finally {

        setLoadingCars(false);

      }
    };
    fetchCars();

  }, [user]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    const price =
  Number(formData.startingPrice);

if (!formData.car) {
  setError("Please select a car.");
  return;
}

if (
  Number.isNaN(price) ||
  price < 0
) {
  setError(
    "Starting price must be a valid number."
  );
  return;
}

if (!formData.startDate) {
  setError(
    "Please select a start date."
  );
  return;
}

if (!formData.endDate) {
  setError(
    "Please select an end date."
  );
  return;
}

const start =
  new Date(formData.startDate);

const end =
  new Date(formData.endDate);

if (end <= start) {
  setError(
    "End date must be after start date."
  );
  return;
}
    setLoading(true);

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await api.post(
          "/auctions",
          {
            car: formData.car,

            startingPrice:
              Number(
                formData.startingPrice
              ),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setSuccess(
        response.data.message ||
        "Auction created successfully!"
      );

      /*
       * Wait a moment so the
       * success message can be seen.
       */

      setTimeout(() => {
        navigate("/auctions");
      }, 800);

    } catch (error) {

      console.error(
        "Create auction error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to create auction."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {

    return (
      <main className="create-auction-page">

        <div className="create-auction-container">

          <div className="create-auction-login">

            <h2>
              Login Required
            </h2>

            <p>
              You need to login before
              creating an auction.
            </p>

            <Link
              to="/login"
              className="primary-button"
            >
              Login
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="create-auction-page">

      <div className="create-auction-container">

        <div className="create-auction-header">

          <Link
            to="/dashboard"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>

          <p className="section-label">
            SELL ON AUTOBID TN
          </p>

          <h1>
            Create an Auction
          </h1>

          <p>
            Choose one of your cars and
            configure the auction.
          </p>

        </div>

        <form
          className="create-auction-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              CAR
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Select Your Car
              </h2>

              <p>
                Only your cars can be placed
                on auction.
              </p>

            </div>

            {loadingCars ? (

              <p className="form-loading">
                Loading your cars...
              </p>

            ) : cars.length === 0 ? (

              <div className="no-seller-cars">

                <h3>
                  You don't have any cars yet.
                </h3>

                <p>
                  Create a car listing first.
                </p>

                <Link
                  to="/sell-car"
                  className="primary-button"
                >
                  Add a Car
                </Link>

              </div>

            ) : (

              <div className="form-group">

                <label>
                  Car
                </label>

                <select
                  name="car"
                  value={formData.car}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a car
                  </option>

                  {cars.map((car) => (

                    <option
                      key={car._id}
                      value={car._id}
                    >
                      {car.title}
                    </option>

                  ))}

                </select>

              </div>

            )}

          </div>

          {/* =========================
              PRICE
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Auction Price
              </h2>

              <p>
                Set the minimum starting bid.
              </p>

            </div>

            <div className="form-group">

              <label>
                Starting Price (TND)
              </label>

              <input
                type="number"
                name="startingPrice"
                value={
                  formData.startingPrice
                }
                onChange={handleChange}
                placeholder="25000"
                min="0"
                required
              />

            </div>

          </div>

          {/* =========================
              DATES
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Auction Dates
              </h2>

              <p>
                Define when bidding starts
                and ends.
              </p>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  name="startDate"
                  value={
                    formData.startDate
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  End Date
                </label>

                <input
                  type="datetime-local"
                  name="endDate"
                  value={
                    formData.endDate
                  }
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="create-auction-error">
              {error}
            </div>
          )}

          {/* =========================
              SUCCESS
          ========================= */}

          {success && (
            <div className="create-auction-success">
              {success}
            </div>
          )}

          {/* =========================
              ACTIONS
          ========================= */}

          <div className="create-auction-actions">

            <Link
              to="/dashboard"
              className="cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="create-auction-submit"
              disabled={
                loading ||
                loadingCars ||
                cars.length === 0
              }
            >
              {loading
                ? "Creating Auction..."
                : "Create Auction"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
};

export default CreateAuction;