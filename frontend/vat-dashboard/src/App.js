// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/connectio";
import StoresPage from "./pages/StoresPage";
import VatRatesPage from "./pages/VatRatesPage";
import SalesDashboardPage from "./pages/SalesDashboardPage";
import VatReportPage from "./pages/VatReportPages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sales-dashboard" element={<SalesDashboardPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="vat-rates" element={<VatRatesPage />} />
          <Route path="vat-report" element={<VatReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}