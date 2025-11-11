import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "./ToastManager.css";

const ToastManager = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />
);

export const showToast = (message, type = "default") => {
  if (!message) return;
  const toastContent = <div className="notification-content">{message}</div>;

  switch (type) {
    case "success":
      toast.success(toastContent);
      break;
    case "error":
      toast.error(toastContent);
      break;
    case "info":
      toast.info(toastContent);
      break;
    case "warning":
      toast.warn(toastContent);
      break;
    default:
      toast(toastContent);
      break;
  }
};

export default ToastManager;
