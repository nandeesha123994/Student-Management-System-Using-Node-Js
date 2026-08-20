import { useEffect } from "react";
import { useNotification } from "../context/NotificationContext";
import "../styles/Notification.css";

function Notification() {
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (!notification.message) return;

    const timer = setTimeout(() => {
      hideNotification();
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification, hideNotification]);

  if (!notification.message) return null;

  return (
    <div className={`notification ${notification.type}`} role="alert">
      {notification.message}
    </div>
  );
}

export default Notification;
