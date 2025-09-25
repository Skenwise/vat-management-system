// src/services/api.js
//
import axios from "axios";

// Base URL for your FastAPI server
const API_BASE = "https://your-subdomain.serveo.net/:8000";

// Example: Optional timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export const connectDB = async (data) => {
  return api.post("/connect-db", data);
};

export const getStores = async () => {
  return api.get("/stores");
};

export const getVATRates = async () => {
  return api.get("/vat-rates");
};

export const getVatSummary = async (params) => {
  // params: { start_date, end_date, store_id }
  return api.get("/vat-summary", { params });
};

export const getVatReport = async (params) => {
  return api.get("/vat-return", { params });
};