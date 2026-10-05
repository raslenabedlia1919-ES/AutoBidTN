import { useEffect, useState } from "react";
import {
  Link,
  useParams
} from "react-router-dom";

import { io } from "socket.io-client";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CarDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // =========================
  // CAR
  // =========================

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // BIDS
  // =========================

  const [bidAmount, setBidAmount] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [bidMessage, setBidMessage] = useState("");
  const [bids, setBids] = useState([]);

  // =========================
  // COUNTDOWN
  // =========================

  const [timeLeft, setTimeLeft] = useState(0);

  // =========================
  // FAVORITE
  // =========================

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // =========================
  // COMMENTS
  // =========================

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  // =====================================================
  // FETCH CAR
  // =====================================================

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response =
          await api.get(
            `/cars/${id}`
          );

        setCar(
          response.data
        );

      } catch (error) {

        console.error(
          "Error fetching car:",
          error
        );

        setError(
          error.response?.data?.message ||
          "Unable to load car."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchCar();

  }, [id]);

  // =====================================================
  // FETCH BIDS
  // =====================================================

  useEffect(() => {

    const fetchBids = async () => {

      if (!car?.auction?._id) {
        return;
      }

      try {

        const response =
          await api.get(
            `/bids/auction/${car.auction._id}`
          );

        setBids(
          response.data.bids || []
        );

      } catch (error) {

        console.error(
          "Error fetching bids:",
          error
        );

      }
    };

    fetchBids();

  }, [car?.auction?._id]);

  // =====================================================
  // SOCKET.IO LIVE AUCTION
  // =====================================================

  useEffect(() => {

    if (!car?.auction?._id) {
      return;
    }

    const auctionId =
      car.auction._id;

    const socket =
      io(
        "http://localhost:5000"
      );

    socket.on(
      "connect",
      () => {

        console.log(
          "Connected to Socket.IO:",
          socket.id
        );

        socket.emit(
          "joinAuction",
          auctionId
        );

      }
    );

    // ------------------------------------------
    // NEW BID
    // ------------------------------------------

    socket.on(
      "bidPlaced",
      (data) => {

        console.log(
          "Live bid received:",
          data
        );

        // Update current price
        setCar(
          (currentCar) => {

            if (!currentCar) {
              return currentCar;
            }

            return {
              ...currentCar,

              auction: {
                ...currentCar.auction,

                currentPrice:
                  data.currentPrice
              }
            };

          }
        );

        // Add bid to history
        if (data.bid) {

          setBids(
            (currentBids) => {

              const exists =
                currentBids.some(
                  (bid) =>
                    bid._id ===
                    data.bid._id
                );

              if (exists) {
                return currentBids;
              }

              return [
                data.bid,
                ...currentBids
              ];
            }
          );

        }

      }
    );

    // ------------------------------------------
    // AUCTION STARTED
    // ------------------------------------------

    socket.on(
      "auctionStarted",
      (data) => {

        console.log(
          "Auction started:",
          data
        );

        setCar(
          (currentCar) => {

            if (!currentCar) {
              return currentCar;
            }

            return {
              ...currentCar,

              auction: {
                ...currentCar.auction,

                status:
                  "active"
              }
            };

          }
        );

      }
    );

    // ------------------------------------------
    // AUCTION ENDED
    // ------------------------------------------

    socket.on(
      "auctionEnded",
      (data) => {

        console.log(
          "Auction ended:",
          data
        );

        setTimeLeft(0);

        setCar(
          (currentCar) => {

            if (!currentCar) {
              return currentCar;
            }

            return {
              ...currentCar,

              auction: {
                ...currentCar.auction,

                status:
                  "ended",

                currentPrice:
                  data.currentPrice,

                winner:
                  data.winner
              }
            };

          }
        );

      }
    );

    // ------------------------------------------
    // DISCONNECT
    // ------------------------------------------

    socket.on(
      "disconnect",
      () => {

        console.log(
          "Disconnected from Socket.IO"
        );

      }
    );

    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------

    return () => {

      socket.emit(
        "leaveAuction",
        auctionId
      );

      socket.disconnect();

    };

  }, [car?.auction?._id]);

  // =====================================================
  // FETCH COMMENTS
  // =====================================================

  useEffect(() => {

    const fetchComments = async () => {

      try {

        const response =
          await api.get(
            `/comments/car/${id}`
          );

        setComments(
          response.data.comments || []
        );

      } catch (error) {

        console.error(
          "Error fetching comments:",
          error
        );

      }
    };

    fetchComments();

  }, [id]);

  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  useEffect(() => {

    const checkFavorite = async () => {

      if (!user || !car) {
        return;
      }

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await api.get(
            "/favorites/my-favorites",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        const favorites =
          response.data
            .favorites || [];

        const favorite =
          favorites.find(
            (item) => {

              const favoriteCarId =
                item.car?._id ||
                item.car;

              return (
                favoriteCarId ===
                car._id
              );

            }
          );

        if (favorite) {

          setIsFavorite(
            true
          );

          setFavoriteId(
            favorite._id
          );

        } else {

          setIsFavorite(
            false
          );

          setFavoriteId(
            null
          );

        }

      } catch (error) {

        console.error(
          "Error checking favorite:",
          error
        );

      }

    };

    checkFavorite();

  }, [user, car]);

  // =====================================================
  // COUNTDOWN
  // =====================================================

  useEffect(() => {

    if (!car?.auction?.endDate) {
      return;
    }

    const calculateTime = () => {

      const end =
        new Date(
          car.auction.endDate
        ).getTime();

      const now =
        new Date().getTime();

      const difference =
        end - now;

      if (difference <= 0) {

        setTimeLeft(0);

      } else {

        setTimeLeft(
          difference
        );

      }

    };

    calculateTime();

    const interval =
      setInterval(
        calculateTime,
        1000
      );

    return () =>
      clearInterval(
        interval
      );

  }, [
    car?.auction?.endDate
  ]);

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTimeLeft = (
    milliseconds
  ) => {

    const totalSeconds =
      Math.floor(
        milliseconds / 1000
      );

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (totalSeconds % 86400) /
        3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) /
        60
      );

    const seconds =
      totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const handleFavorite = async () => {

    if (!user) {

      alert(
        "Please login to add favorites."
      );

      return;
    }

    setFavoriteLoading(
      true
    );

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      // REMOVE
      if (
        isFavorite &&
        favoriteId
      ) {

        await api.delete(
          `/favorites/${favoriteId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        setIsFavorite(
          false
        );

        setFavoriteId(
          null
        );

        return;
      }

      // ADD
      const response =
        await api.post(
          "/favorites",
          {
            car:
              car._id
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setIsFavorite(
        true
      );

      setFavoriteId(
        response.data
          .favorite?._id
      );

    } catch (error) {

      console.error(
        "Favorite error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to update favorite."
      );

    } finally {

      setFavoriteLoading(
        false
      );

    }
  };

  // =====================================================
  // PLACE BID
  // =====================================================

  const handleBid = async (
    e
  ) => {

    e.preventDefault();

    if (!user) {

      setBidMessage(
        "Please login before placing a bid."
      );

      return;
    }

    if (!bidAmount) {

      setBidMessage(
        "Please enter a bid amount."
      );

      return;
    }

    setBidLoading(
      true
    );

    setBidMessage("");

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await api.post(
          "/bids",
          {
            auction:
              car.auction._id,

            amount:
              Number(
                bidAmount
              )
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setBidMessage(
        response.data.message ||
        "Bid placed successfully!"
      );

      setBidAmount("");

      // Refresh car
      const carResponse =
        await api.get(
          `/cars/${id}`
        );

      setCar(
        carResponse.data
      );

      // Refresh bids
      const bidsResponse =
        await api.get(
          `/bids/auction/${car.auction._id}`
        );

      setBids(
        bidsResponse.data.bids ||
        []
      );

    } catch (error) {

      console.error(
        "Bid error:",
        error
      );

      setBidMessage(
        error.response?.data?.message ||
        "Unable to place bid."
      );

    } finally {

      setBidLoading(
        false
      );

    }

  };

  // =====================================================
  // ADD COMMENT
  // =====================================================

  const handleComment = async (
    e
  ) => {

    e.preventDefault();

    if (!user) {

      setCommentMessage(
        "Please login to write a comment."
      );

      return;
    }

    if (
      !commentText.trim()
    ) {

      setCommentMessage(
        "Please write something."
      );

      return;
    }

    setCommentLoading(
      true
    );

    setCommentMessage("");

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await api.post(
          "/comments",
          {
            car:
              car._id,

            text:
              commentText.trim()
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setComments(
        (current) => [
          response.data.comment,
          ...current
        ]
      );

      setCommentText("");

      setCommentMessage(
        "Comment added successfully."
      );

    } catch (error) {

      console.error(
        "Comment error:",
        error
      );

      setCommentMessage(
        error.response?.data?.message ||
        "Unable to add comment."
      );

    } finally {

      setCommentLoading(
        false
      );

    }
  };

  // =====================================================
  // DELETE COMMENT
  // =====================================================

  const handleDeleteComment =
    async (commentId) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        await api.delete(
          `/comments/${commentId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        setComments(
          (current) =>
            current.filter(
              (comment) =>
                comment._id !==
                commentId
            )
        );

      } catch (error) {

        console.error(
          "Delete comment error:",
          error
        );

        alert(
          error.response?.data?.message ||
          "Unable to delete comment."
        );

      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="details-loading">

        <h2>
          Loading car...
        </h2>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !car) {

    return (
      <div className="details-error">

        <h2>
          {error ||
            "Car not found"}
        </h2>

        <Link to="/cars">
          ← Back to cars
        </Link>

      </div>
    );
  }

  const auction =
    car.auction;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="details-page">

      <div className="details-container">

        {/* BACK */}

        <Link
          to="/cars"
          className="back-link"
        >
          ← Back to Cars
        </Link>

        <div className="details-grid">

          {/* IMAGES */}

          <div className="details-images">

            <div className="details-main-image">

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

                <div className="details-no-image">
                  🚗
                </div>

              )}

            </div>

            {car.images &&
              car.images.length > 1 && (

              <div className="details-thumbnails">

                {car.images.map(
                  (
                    image,
                    index
                  ) => (

                    <img
                      key={index}
                      src={image}
                      alt={`${car.title} ${index + 1}`}
                    />

                  )
                )}

              </div>

            )}

          </div>

          {/* CAR INFO */}

          <div className="details-info">

            <div className="details-title-row">

              <div>

                <p className="section-label">
                  {car.brand}
                </p>

                <h1>
                  {car.title}
                </h1>

                <p className="details-location">
                  📍{" "}
                  {car.location}
                </p>

              </div>

              {/* FAVORITE */}

              <button
                className={`favorite-button ${
                  isFavorite
                    ? "favorite-active"
                    : ""
                }`}
                onClick={
                  handleFavorite
                }
                disabled={
                  favoriteLoading
                }
                title={
                  isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >

                {isFavorite
                  ? "♥"
                  : "♡"}

              </button>

            </div>

            {/* SPECIFICATIONS */}

            <div className="specifications">

              <div>

                <span>
                  Year
                </span>

                <strong>
                  {car.year}
                </strong>

              </div>

              <div>

                <span>
                  Mileage
                </span>

                <strong>
                  {Number(
                    car.mileage || 0
                  ).toLocaleString()}{" "}
                  km
                </strong>

              </div>

              <div>

                <span>
                  Fuel
                </span>

                <strong>
                  {car.fuelType}
                </strong>

              </div>

              <div>

                <span>
                  Transmission
                </span>

                <strong>
                  {car.transmission}
                </strong>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="description">

              <h2>
                Description
              </h2>

              <p>
                {car.description}
              </p>

            </div>

            {/* AUCTION */}

            {auction ? (

              <div className="auction-box">

                <div className="auction-header">

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

                  <span className="auction-status">
                    {auction.status}
                  </span>

                </div>

                {/* COUNTDOWN */}

                {auction.status ===
                  "active" && (

                  <div className="countdown">

                    <span>
                      ⏱ Ends in
                    </span>

                    <strong>
                      {timeLeft === 0
                        ? "Auction ended"
                        : formatTimeLeft(
                            timeLeft
                          )}
                    </strong>

                  </div>

                )}

                {/* BID FORM */}

                {auction.status ===
                  "active" &&
                  timeLeft > 0 && (

                  <>
                    {user ? (

                      <form
                        className="bid-form"
                        onSubmit={
                          handleBid
                        }
                      >

                        <label>
                          Your Bid
                        </label>

                        <div className="bid-input-row">

                          <input
                            type="number"
                            min={
                              Number(
                                auction.currentPrice ||
                                0
                              ) + 1
                            }
                            value={
                              bidAmount
                            }
                            onChange={
                              (e) =>
                                setBidAmount(
                                  e.target.value
                                )
                            }
                            placeholder={`More than ${auction.currentPrice}`}
                          />

                          <button
                            type="submit"
                            disabled={
                              bidLoading
                            }
                          >

                            {bidLoading
                              ? "Bidding..."
                              : "Place Bid"}

                          </button>

                        </div>

                        {bidMessage && (

                          <p className="bid-message">
                            {bidMessage}
                          </p>

                        )}

                      </form>

                    ) : (

                      <p className="login-bid-message">

                        Please{" "}

                        <Link to="/login">
                          login
                        </Link>

                        {" "}to place a bid.

                      </p>

                    )}

                  </>
                )}

                {/* COUNTDOWN ENDED */}

                {auction.status ===
                  "active" &&
                  timeLeft === 0 && (

                  <div className="auction-ended-message">

                    🏁 This auction has ended.

                  </div>

                )}

                {/* ENDED + WINNER */}

                {auction.status ===
                  "ended" && (

                  <div className="auction-ended-message">

                    🏁 Auction ended

                    {auction.winner && (

                      <div className="auction-winner">

                        🏆 Winner:{" "}

                        {auction.winner.name ||
                          "Winner"}

                      </div>

                    )}

                  </div>

                )}

              </div>

            ) : (

              <div className="no-auction">

                This car currently has no auction.

              </div>

            )}

          </div>

        </div>

        {/* BID HISTORY */}

        <div className="bid-history">

          <h2>
            Bid History
          </h2>

          {bids.length === 0 ? (

            <p className="no-bids">
              No bids yet.
            </p>

          ) : (

            <div className="bids-list">

              {bids.map(
                (bid) => (

                <div
                  className="bid-item"
                  key={bid._id}
                >

                  <div>

                    <strong>
                      {bid.bidder?.name ||
                        "User"}
                    </strong>

                    <span>
                      {new Date(
                        bid.createdAt
                      ).toLocaleString()}
                    </span>

                  </div>

                  <strong className="bid-amount">

                    {Number(
                      bid.amount || 0
                    ).toLocaleString()}{" "}
                    TND

                  </strong>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* COMMENTS */}

        <div className="comments-section">

          <div className="comments-header">

            <div>

              <h2>
                Questions & Comments
              </h2>

              <p>
                Ask questions or share your
                thoughts about this car.
              </p>

            </div>

            <span>

              {comments.length} comment
              {comments.length !== 1
                ? "s"
                : ""}

            </span>

          </div>

          {/* COMMENT FORM */}

          {user ? (

            <form
              className="comment-form"
              onSubmit={
                handleComment
              }
            >

              <textarea
                value={
                  commentText
                }
                onChange={
                  (e) =>
                    setCommentText(
                      e.target.value
                    )
                }
                placeholder="Ask a question about this car..."
                maxLength={1000}
                rows={4}
              />

              <div className="comment-form-footer">

                <span>
                  {commentText.length}/1000
                </span>

                <button
                  type="submit"
                  disabled={
                    commentLoading
                  }
                >

                  {commentLoading
                    ? "Posting..."
                    : "Post Comment"}

                </button>

              </div>

              {commentMessage && (

                <p className="comment-message">
                  {commentMessage}
                </p>

              )}

            </form>

          ) : (

            <div className="comment-login-message">

              <p>

                Please{" "}

                <Link to="/login">
                  login
                </Link>

                {" "}to ask a question or
                write a comment.

              </p>

            </div>

          )}

          {/* COMMENTS LIST */}

          <div className="comments-list">

            {comments.length === 0 ? (

              <div className="no-comments">

                <div>
                  💬
                </div>

                <h3>
                  No comments yet
                </h3>

                <p>
                  Be the first to ask a
                  question about this car.
                </p>

              </div>

            ) : (

              comments.map(
                (comment) => (

                  <div
                    className="comment-item"
                    key={comment._id}
                  >

                    <div className="comment-avatar">

                      {comment.user?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}

                    </div>

                    <div className="comment-content">

                      <div className="comment-top">

                        <div>

                          <strong>
                            {comment.user?.name ||
                              "User"}
                          </strong>

                          <span>
                            {new Date(
                              comment.createdAt
                            ).toLocaleString()}
                          </span>

                        </div>

                        {user &&
                          comment.user?._id ===
                            user.id && (

                          <button
                            className="delete-comment"
                            type="button"
                            onClick={() =>
                              handleDeleteComment(
                                comment._id
                              )
                            }
                          >
                            Delete
                          </button>

                        )}

                      </div>

                      <p>
                        {comment.text}
                      </p>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </main>
  );
};

export default CarDetails;