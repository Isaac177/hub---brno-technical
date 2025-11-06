import React from "react";
import { useTranslation } from "react-i18next";

const Loader = () => {
  const { t } = useTranslation();
  
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div className="loader"></div>
      <style jsx>{`
        .loader {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: blue;
          box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.25);
          animation: l2 1.5s infinite linear;
          position: relative;
        }
        .loader:before,
        .loader:after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 0 rgba(0, 0, 255, 0.25);
          animation: inherit;
          animation-delay: -0.5s;
        }
        .loader:after {
          animation-delay: -1s;
        }
        @keyframes l2 {
          100% {
            box-shadow: 0 0 0 60px rgba(0, 0, 255, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
