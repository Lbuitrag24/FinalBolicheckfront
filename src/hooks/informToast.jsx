import { toast } from "react-toastify";

const useInformToast = () => {
  return ({ message, list = [], postMessage = "" }) => {
    return new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {message && <p className="text-center">{message}</p>}

            {list.length > 0 && (
              <ul style={{ marginTop: "4px" }}>
                {list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            {postMessage && <p className="text-center">{postMessage}</p>}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
              <button
                className="btn secondary-btn-style"
                onClick={() => {
                  resolve(true);
                  closeToast();
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          closeButton: false,
          position: "bottom-right",
          theme: "dark",
        }
      );
    });
  };
};

export default useInformToast;
