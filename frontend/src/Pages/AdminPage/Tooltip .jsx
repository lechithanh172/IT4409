import ReactDOM from "react-dom";

const Tooltip = ({ visible, content, position, onClose }) => {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: "62.75px",
        left: "1103.24px",
        zIndex: 9999,
        backgroundColor: "#fff",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        padding: "10px",
        borderRadius: "8px",
        width: "290px",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "transparent",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      {content}
    </div>,
    document.body
  );
};

export default Tooltip;