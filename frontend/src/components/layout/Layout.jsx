// src/components/layout/Layout.jsx
console.log("Layout が描画された");
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
// import CurrentUsageBar from "./CurrentUsageBar"; // ✅ コメントアウト
import Footer from "./Footer";

export default function Layout({ children }) {
  const location = useLocation();

  // ✅ 認証系ページでは利用状況バーを非表示
  const hideUsageBar = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);

  return (
    <>
      <Header />
      
      {/* ✅ 一時的に無効化 */}
      {/* {!hideUsageBar && <CurrentUsageBar />} */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        {children}
      </div>

      <Footer />
    </>
  );
}