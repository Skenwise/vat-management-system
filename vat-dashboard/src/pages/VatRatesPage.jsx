// src/pages/VatRatesPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert
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
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          VAT Rates
        </Typography>

        {/* VAT Rates Grid */}
        <Grid container spacing={3}>
          {vatRates.map((rate, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-5px)" },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Calculate sx={{ color: "#667eea", mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {rate.vat_rate}% VAT
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Items using this rate: {rate.item_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {vatRates.length === 0 && !isLoading && (
            <Typography variant="body1" color="white" sx={{ mt: 4 }}>
              No VAT rates found.
            </Typography>
          )}
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert severity="info">{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}