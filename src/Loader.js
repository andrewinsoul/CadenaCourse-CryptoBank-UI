import React from "react";

function Loader({ classStyle, loading }) {
  return (
    loading && (
      <div className={classStyle}>
        <i className="fas fa-sync fa-spin" />
      </div>
    )
  );
}

export default Loader;
