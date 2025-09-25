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

        {/* VAT Rates Grid */}
        <Grid container spacing={4}>
          {vatRates.map((rate, idx) => (
            <Grid item xs={12} sm={6} md={6} key={idx}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                  },
                  p: 3,
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    sx={{ fontSize: 36 }}
                  >
                    <Calculate
                      sx={{ color: "#667eea", mr: 2, fontSize: 40 }}
                    />
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "#333" }}
                    >
                      {rate.vat_rate}% VAT
                    </Typography>
                  </Box>

                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Items using this rate: {rate.item_count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {vatRates.length === 0 && !isLoading && (
            <Typography
              variant="body1"
              color="white"
              sx={{ mt: 4, textAlign: "center" }}
            >
              No VAT rates found.
            </Typography>
          )}
        </Grid>
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