// src/services/api.js
//
import axios from "axios";

// Base URL for your FastAPI server
const API_BASE = process.env.REACT_APP_API_BASE;

// Example: Optional timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const connectDB = async (data) => {
  return api.post("/connect-db", data);
};

export const getDepartments = async () => {
  return api.get("/departments");
};

export const getVATRates = async () => {
  return api.get("/vat-rates");
};

export const getSalesDashboard = (params) => {
  return api.get('/sales-dashboard', { params });
};

export const getVatReport = async (params) => {
  return api.get("/vat-return", { params });
};