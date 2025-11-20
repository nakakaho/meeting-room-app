// src/components/layout/Layout.jsx
console.log("Layout が描画された");
import React from "react";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
