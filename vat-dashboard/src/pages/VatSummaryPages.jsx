// src/pages/VatSummaryPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper
} from "@mui/material";
import { getVatSummary, getStores } from "../services/api";
import { DBContext } from "../context/DBcontext";

export default function VatSummaryPage() {
  const { connection } = useContext(DBContext);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [storeId, setStoreId] = useState("");

  // Data
  const [summary, setSummary] = useState({});
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [stores, setStores] = useState([]);

  // Loading and snack
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Load stores on mount
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await getStores();
        setStores(res.data.stores);
      } catch (err) {
        setSnackMsg("Failed to load stores");
        setSnackOpen(true);
      }
    }
    loadStores();
  }, []);

  // Fetch VAT summary
  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setSnackMsg("Please select start and end dates");
      setSnackOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await getVatSummary({
        start_date: startDate,
        end_date: endDate,
        StoreID: storeId || undefined,
      });
      setSummary(res.data.summary);
      setDailyBreakdown(res.data.daily_breakdown);
    } catch (err) {
      setSnackMsg("Failed to fetch summary");
      setSnackOpen(true);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          VAT Summary
        </Typography>

        {/* Filter Form */}
        <Box mb={6}>
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", p: 4 }}>
            <CardContent>
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  select
                  label="Store"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ flex: 1 }}
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.ID} value={store.ID}>
                      {store.Name}
                    </option>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  sx={{ py: 2, px: 4, background: "linear-gradient(45deg, #667eea, #764ba2)" }}
                  onClick={fetchSummary}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Fetch Summary"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Summary Cards */}
        {summary && Object.keys(summary).length > 0 && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Gross Sales</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_gross_sales || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Taxable Sales</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_taxable_sales || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Non-Taxable Sales</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_non_taxable_sales || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total VAT</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_vat_amount || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Discounts</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_discounts || 0}</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Daily Breakdown Table */}
        {dailyBreakdown && dailyBreakdown.length > 0 && (
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Gross Sales</TableCell>
                      <TableCell>Taxable Sales</TableCell>
                      <TableCell>Non-Taxable Sales</TableCell>
                      <TableCell>VAT</TableCell>
                      <TableCell>Discounts</TableCell>
                      <TableCell>Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailyBreakdown.map((d, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{d.TransactionDate}</TableCell>
                        <TableCell>${d.TotalExcl}</TableCell>
                        <TableCell>${d.TotalTaxable || 0}</TableCell>
                        <TableCell>${d.TotalNonTaxable || 0}</TableCell>
                        <TableCell>${d.TotalVAT}</TableCell>
                        <TableCell>${d.TotalDiscounts}</TableCell>
                        <TableCell>{d.TransactionCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert severity="info">{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}