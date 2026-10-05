import {
  useEffect,
  useState
} from "react";

import { io } from "socket.io-client";

import { useAuth } from "../context/AuthContext";

const NotificationBell = () => {

  const { user } = useAuth();

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    open,
    setOpen
  ] = useState(false);

  // ==========================================
  // SOCKET
  // ==========================================

  useEffect(() => {

    if (!user) {
      setNotifications([]);
      return;
    }

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      return;
    }

    const socket =
      io(
        "http://localhost:5000",
        {
          auth: {
            token
          }
        }
      );

    socket.on(
      "connect",
      () => {

        console.log(
          "Notification socket connected"
        );

      }
    );

    socket.on(
      "notification",
      (notification) => {

        console.log(
          "Notification received:",
          notification
        );

        setNotifications(
          (current) => [
            {
              ...notification,
              id:
                Date.now() +
                Math.random()
            },
            ...current
          ]
        );

      }
    );

    return () => {
      socket.disconnect();
    };

  }, [user]);

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const removeNotification = (
    id
  ) => {

    setNotifications(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );

  };

  const unreadCount =
    notifications.length;

  // ==========================================
  // UI
  // ==========================================

  if (!user) {
    return null;
  }

  return (
    <div className="notification-wrapper">

      <button
        type="button"
        className="notification-button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        title="Notifications"
      >

        🔔

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}

      </button>

      {open && (

        <div className="notification-dropdown">

          <div className="notification-header">

            <strong>
              Notifications
            </strong>

            <span>
              {notifications.length}
            </span>

          </div>

          {notifications.length === 0 ? (

            <div className="notification-empty">
              <div>
                🔕
              </div>

              <p>
                No notifications yet.
              </p>
            </div>

          ) : (

            <div className="notification-list">

              {notifications.map(
                (notification) => (

                  <div
                    className={`notification-item notification-${notification.type}`}
                    key={
                      notification.id
                    }
                  >

                    <div className="notification-icon">

                      {notification.type ===
                      "outbid"
                        ? "⚡"
                        : notification.type ===
                          "won"
                          ? "🏆"
                          : "🔔"}

                    </div>

                    <div className="notification-content">

                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeNotification(
                            notification.id
                          )
                        }
                      >
                        Dismiss
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>
      )}

    </div>
  );
};

export default NotificationBell;