import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        const isSuperUser = localStorage.getItem("is_superuser") === "true";
        const isStaff = localStorage.getItem("is_staff") === "true";
        const token = localStorage.getItem("token");
      
        if (isSuperUser && isStaff) {
          navigate("/admin/dashboard");
        } else if (isStaff) {
          navigate("/employee/dashboard");
        } else if (token) {
          navigate("/client/dashboard");
        } else {
          navigate("/login");
        }
      };
    
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <img
        src="/rana.png"
        className="class_ranita_imagen"
        alt="Imagen de inicio"
      />
          <div className="rounded-4 p-5 shadow-lg wrapper text-center w-75">
            <div style={{ fontSize: "5rem" }}>🚫</div>
            <h1 className="mt-3">¿E ibas... a dónde exactamente?</h1>
            <p className="fs-5 mt-3">
              Parece que intentaste acceder a un lugar donde no perteneces.  
              <br />Tranquilo, no llamaremos a los de sistemas... al menos por ahora.
            </p>
      
            <button
              className="btn mt-4 px-4"
              onClick={handleGoBack}
            >
              Volver a mi zona segura
            </button>
          </div>
        </div>
      );
      
}

export default Unauthorized