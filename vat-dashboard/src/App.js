// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/connectio";
import StoresPage from "./pages/StoresPage";
import VatRatesPage from "./pages/VatRatesPage";
import VatSummaryPage from "./pages/VatSummaryPages";
import VatReportPage from "./pages/VatReportPages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="summary" element={<VatSummaryPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="vat-rates" element={<VatRatesPage />} />
          <Route path="vat-report" element={<VatReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}