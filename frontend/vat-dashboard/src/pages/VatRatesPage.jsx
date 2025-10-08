// src/pages/VatRatesPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { Calculate } from "@mui/icons-material";
import { getVATRates } from "../services/api";
import { DBContext } from "../context/DBcontext";

export default function VatRatesPage() {
  const { connection } = useContext(DBContext);
  const [vatRates, setVatRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    async function fetchVATRates() {
      setIsLoading(true);
      try {
        const res = await getVATRates();
        setVatRates(res.data.vat_rates);
      } catch (err) {
        setSnackMsg("Failed to load VAT rates");
        setSnackOpen(true);
      }
      setIsLoading(false);
    }

    fetchVATRates();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: 700, mb: 4 }}
        >
          VAT Rates
        </Typography>

        {/* VAT Rates Table */}
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>VAT Rate (%)</b></TableCell>
                <TableCell><b>Department</b></TableCell>
                <TableCell><b>Item Count</b></TableCell>
                <TableCell><b>Total Sales</b></TableCell>
                <TableCell><b>Total VAT Collected</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vatRates.map((rate, idx) => (
                <TableRow key={idx}>
                  <TableCell>{rate.vat_rate}</TableCell>
                  <TableCell>{rate.department || "All"}</TableCell>
                  <TableCell>{rate.item_count}</TableCell>
                  <TableCell>{rate.total_sales ? rate.total_sales.toLocaleString() : 0}</TableCell>
                  <TableCell>{rate.total_vat ? rate.total_vat.toLocaleString() : 0}</TableCell>
                </TableRow>
              ))}
              {vatRates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No VAT rates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert severity="info">{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}