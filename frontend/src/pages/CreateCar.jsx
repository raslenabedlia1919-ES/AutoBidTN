import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreateCar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // =========================
  // FORM
  // =========================

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "Petrol",
    transmission: "Manual",
    description: "",
    location: "",
    images: ""
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem("token");

      // Convert comma-separated
      // image URLs into an array

      const imageArray =
        formData.images
          .split(",")
          .map((image) => image.trim())
          .filter((image) => image !== "");

      const response =
        await api.post(
          "/cars",
          {
            title: formData.title,
            brand: formData.brand,
            model: formData.model,
            year: Number(formData.year),
            mileage: Number(formData.mileage),
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            description: formData.description,
            location: formData.location,
            images: imageArray
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      // Go to the created car

      const newCar =
        response.data.car;

      navigate(
        `/cars/${newCar._id}`
      );

    } catch (error) {

      console.error(
        "Create car error:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to create car."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!user) {
    return (
      <main className="create-car-page">

        <div className="create-car-container">

          <div className="create-car-login">

            <h2>
              Login Required
            </h2>

            <p>
              You need to login before
              creating a car listing.
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

  // =========================
  // PAGE
  // =========================

  return (
    <main className="create-car-page">

      <div className="create-car-container">

        {/* HEADER */}

        <div className="create-car-header">

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
            List Your Car
          </h1>

          <p>
            Add your vehicle and prepare it
            for an auction.
          </p>

        </div>

        {/* FORM */}

        <form
          className="create-car-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              BASIC INFORMATION
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Basic Information
              </h2>

              <p>
                Tell buyers about the vehicle.
              </p>

            </div>

            <div className="form-grid">

              <div className="form-group full-width">

                <label>
                  Car Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="BMW 320i M Sport"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="BMW"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="320i"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2022"
                  min="1900"
                  max="2100"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Mileage (km)
                </label>

                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="45000"
                  min="0"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Fuel Type
                </label>

                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                >
                  <option value="Petrol">
                    Petrol
                  </option>

                  <option value="Diesel">
                    Diesel
                  </option>

                  <option value="Hybrid">
                    Hybrid
                  </option>

                  <option value="Electric">
                    Electric
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Transmission
                </label>

                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                >
                  <option value="Manual">
                    Manual
                  </option>

                  <option value="Automatic">
                    Automatic
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Tunis"
                  required
                />

              </div>

            </div>

          </div>

          {/* =========================
              DESCRIPTION
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Description
              </h2>

              <p>
                Give buyers more information
                about the car.
              </p>

            </div>

            <div className="form-group">

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the condition, equipment, maintenance history..."
                rows={7}
                maxLength={3000}
                required
              />

              <small>
                {formData.description.length}
                /3000
              </small>

            </div>

          </div>

          {/* =========================
              IMAGES
          ========================= */}

          <div className="form-section">

            <div className="form-section-header">

              <h2>
                Car Images
              </h2>

              <p>
                Add image URLs separated by commas.
              </p>

            </div>

            <div className="form-group">

              <textarea
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
                rows={4}
              />

              <small>
                Example: paste 2 or 3 image
                URLs separated by commas.
              </small>

            </div>

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="create-car-error">
              {error}
            </div>
          )}

          {/* =========================
              ACTIONS
          ========================= */}

          <div className="create-car-actions">

            <Link
              to="/dashboard"
              className="cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="create-car-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Listing..."
                : "Create Car Listing"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
};

export default CreateCar;