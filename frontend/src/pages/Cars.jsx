import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const Cars = () => {
  // =====================================================
  // CARS
  // =====================================================

  const [cars, setCars] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    fuelType: "",
    transmission: "",
    location: "",
    minYear: "",
    maxYear: "",
    minMileage: "",
    maxMileage: "",
    minPrice: "",
    maxPrice: "",
    auctionStatus: "",
    sort: "newest",
    page: 1,
    limit: 9
  });

  // =====================================================
  // PAGINATION
  // =====================================================

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalCars, setTotalCars] =
    useState(0);

  // =====================================================
  // FILTER VISIBILITY
  // =====================================================

  const [showFilters, setShowFilters] =
    useState(false);

  // =====================================================
  // FETCH CARS
  // =====================================================

  const fetchCars = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      // Only send filters that have values
      Object.entries(filters).forEach(
        ([key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined
          ) {
            params[key] = value;
          }
        }
      );

      const response = await api.get(
        "/cars",
        {
          params
        }
      );

      const data = response.data;

      const resultCars =
        data.cars ||
        data.data ||
        [];

      setCars(resultCars);

      // Support different backend pagination formats
      const pagination =
        data.pagination || {};

      const total =
        pagination.total ??
        data.total ??
        data.count ??
        resultCars.length;

      const pages =
        pagination.pages ??
        Math.max(
          1,
          Math.ceil(
            total / filters.limit
          )
        );

      setTotalCars(total);
      setTotalPages(pages);

    } catch (error) {

      console.error(
        "Error fetching cars:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load cars."
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // FETCH WHEN FILTERS CHANGE
  // =====================================================

  useEffect(() => {
    fetchCars();
  }, [
    filters.search,
    filters.brand,
    filters.fuelType,
    filters.transmission,
    filters.location,
    filters.minYear,
    filters.maxYear,
    filters.minMileage,
    filters.maxMileage,
    filters.minPrice,
    filters.maxPrice,
    filters.auctionStatus,
    filters.sort,
    filters.page
  ]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
      page:
        name === "page"
          ? Number(value)
          : 1
    }));
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setFilters({
      search: "",
      brand: "",
      fuelType: "",
      transmission: "",
      location: "",
      minYear: "",
      maxYear: "",
      minMileage: "",
      maxMileage: "",
      minPrice: "",
      maxPrice: "",
      auctionStatus: "",
      sort: "newest",
      page: 1,
      limit: 9
    });
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const goToPage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setFilters((current) => ({
      ...current,
      page
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading &&
    cars.length === 0
  ) {
    return (
      <div className="cars-page">

        <div className="cars-container">

          <div className="loading">
            Loading cars...
          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="cars-page">

      <div className="cars-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="cars-header">

          <div>

            <p className="section-label">
              AUTO BID TN
            </p>

            <h1>
              Browse Cars
            </h1>

            <p>
              Find your next car and
              discover available auctions.
            </p>

          </div>

          <div className="cars-total">

            {totalCars}{" "}
            {totalCars === 1
              ? "car"
              : "cars"}

          </div>

        </section>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <section className="cars-search-section">

          <div className="cars-search-row">

            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Search by brand, model or title..."
              />

            </div>

            <select
              name="sort"
              value={filters.sort}
              onChange={handleChange}
              className="sort-select"
            >

              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="yearDesc">
  Newest Year
</option>

<option value="yearAsc">
  Oldest Year
</option>

<option value="mileageAsc">
  Lowest Mileage
</option>

<option value="mileageDesc">
  Highest Mileage
</option>

<option value="priceAsc">
  Lowest Price
</option>

<option value="priceDesc">
  Highest Price
</option>

            </select>

            <button
              type="button"
              className="filter-toggle-button"
              onClick={() =>
                setShowFilters(
                  (current) => !current
                )
              }
            >
              ⚙ Filters
            </button>

          </div>

        </section>

        {/* =================================================
            FILTER PANEL
        ================================================= */}

        <section
          className={`filters-panel ${
            showFilters
              ? "filters-visible"
              : ""
          }`}
        >

          <div className="filters-grid">

            {/* BRAND */}

            <div className="filter-group">

              <label>
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={filters.brand}
                onChange={handleChange}
                placeholder="Toyota"
              />

            </div>

            {/* FUEL */}

            <div className="filter-group">

              <label>
                Fuel Type
              </label>

              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleChange}
              >

                <option value="">
                  All fuel types
                </option>

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

            {/* TRANSMISSION */}

            <div className="filter-group">

              <label>
                Transmission
              </label>

              <select
                name="transmission"
                value={filters.transmission}
                onChange={handleChange}
              >

                <option value="">
                  All transmissions
                </option>

                <option value="Manual">
                  Manual
                </option>

                <option value="Automatic">
                  Automatic
                </option>

              </select>

            </div>

            {/* LOCATION */}

            <div className="filter-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Tunis"
              />

            </div>

            {/* MIN YEAR */}

            <div className="filter-group">

              <label>
                Minimum Year
              </label>

              <input
                type="number"
                name="minYear"
                value={filters.minYear}
                onChange={handleChange}
                placeholder="2015"
              />

            </div>

            {/* MAX YEAR */}

            <div className="filter-group">

              <label>
                Maximum Year
              </label>

              <input
                type="number"
                name="maxYear"
                value={filters.maxYear}
                onChange={handleChange}
                placeholder="2026"
              />

            </div>

            {/* MIN MILEAGE */}

            <div className="filter-group">

              <label>
                Minimum Mileage
              </label>

              <input
                type="number"
                name="minMileage"
                value={filters.minMileage}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />

            </div>

            {/* MAX MILEAGE */}

            <div className="filter-group">

              <label>
                Maximum Mileage
              </label>

              <input
                type="number"
                name="maxMileage"
                value={filters.maxMileage}
                onChange={handleChange}
                placeholder="150000"
                min="0"
              />

            </div>

            {/* MIN PRICE */}

            <div className="filter-group">

              <label>
                Minimum Price (TND)
              </label>

              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="10000"
                min="0"
              />

            </div>

            {/* MAX PRICE */}

            <div className="filter-group">

              <label>
                Maximum Price (TND)
              </label>

              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="100000"
                min="0"
              />

            </div>

            {/* AUCTION STATUS */}

            <div className="filter-group">

              <label>
                Auction Status
              </label>

              <select
                name="auctionStatus"
                value={filters.auctionStatus}
                onChange={handleChange}
              >

                <option value="">
                  All statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="upcoming">
                  Upcoming
                </option>

                <option value="ended">
                  Ended
                </option>

              </select>

            </div>

          </div>

          <div className="filters-actions">

            <button
              type="button"
              onClick={resetFilters}
              className="reset-filters-button"
            >
              Reset Filters
            </button>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="error-message cars-error">
            {error}
          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && cars.length > 0 && (

          <div className="cars-refresh-loading">
            Updating results...
          </div>

        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="cars-container">

          {cars.length === 0 ? (

            <div className="empty-state">

              <div className="empty-cars-icon">
                🚗
              </div>

              <h2>
                No cars found
              </h2>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>

            </div>

          ) : (

            <div className="cars-grid">

              {cars.map((car) => (

                <article
                  className="car-card"
                  key={car._id}
                >

                  {/* IMAGE */}

                  <div className="car-image">

                    {car.images &&
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

                  </div>

                  {/* CONTENT */}

                  <div className="car-content">

                    <div className="car-title-row">

                      <div>

                        <h2>
                          {car.title ||
                            "Untitled Car"}
                        </h2>

                        <p className="car-location">
                          📍{" "}
                          {car.location ||
                            "Location not specified"}
                        </p>

                      </div>

                      {car.auction && (

                        <span className="auction-badge">
                          {car.auction.status}
                        </span>

                      )}

                    </div>

                    {/* CAR INFO */}

                   <div className="car-info">

  <span>
    <img
      src="/icons/calendar.png"
      alt=""
    />
    {car.year}
  </span>

  <span>
    <img
      src="/icons/road.png"
      alt=""
    />
    {Number(
      car.mileage || 0
    ).toLocaleString()} km
  </span>

  <span>
    <img
      src="/icons/fuel.png"
      alt=""
    />
    {car.fuelType}
  </span>

  <span>
    <img
      src="/icons/gear.png"
      alt=""
    />
    {car.transmission}
  </span>

</div>

                    {/* FOOTER */}

                    <div className="car-footer">

                      <div>

                        <small>
                          Current price
                        </small>

                        <strong>

                          {car.auction &&
                          car.auction.currentPrice !==
                            undefined
                            ? `${Number(
                                car.auction
                                  .currentPrice
                              ).toLocaleString()} TND`
                            : "No auction"}

                        </strong>

                      </div>

                      <Link
                        to={`/cars/${car._id}`}
                        className="view-button"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {totalPages > 1 && (

          <div className="cars-pagination">

            <button
              type="button"
              onClick={() =>
                goToPage(
                  filters.page - 1
                )
              }
              disabled={
                filters.page === 1
              }
            >
              ← Previous
            </button>

            <div className="pagination-pages">

              {Array.from(
                {
                  length: totalPages
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  type="button"
                  key={page}
                  className={
                    filters.page === page
                      ? "pagination-active"
                      : ""
                  }
                  onClick={() =>
                    goToPage(page)
                  }
                >
                  {page}
                </button>

              ))}

            </div>

            <button
              type="button"
              onClick={() =>
                goToPage(
                  filters.page + 1
                )
              }
              disabled={
                filters.page ===
                totalPages
              }
            >
              Next →
            </button>

          </div>

        )}

      </div>

    </main>
  );
};

export default Cars;