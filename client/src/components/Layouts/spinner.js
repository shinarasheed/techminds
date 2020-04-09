import React from "react";
import spinner from "../../assets/img/spinner.gif";

export default () => {
  return (
    <>
      <img
        src={spinner}
        alt="Loading..."
        style={{ width: "200px", margin: "auto", display: "block" }}
      />
    </>
  );
};
