
// src/pages/VatReportPage.jsx
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
import { Storage, CheckCircle } from "@mui/icons-material";
import { getVatReport, getStores } from "../services/api"; 
import { DBContext } from "../context/DBcontext"; 

export default function VatReportPage() {
  const { connection } = useContext(DBContext);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [StoreId, setStoreId] = useState("");

  // Data
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
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

  // Fetch VAT report
  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setSnackMsg("Please select start and end dates");
      setSnackOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await getVatReport({
        start_date: startDate,
        end_date: endDate,
        StoreID: StoreId || undefined,
      });
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
    } catch (err) {
      setSnackMsg("Failed to fetch report");
      console.log("Failed error: "+ err);
      setSnackOpen(true);
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          VAT Report
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
                  value={StoreId}
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
                  onClick={fetchReport}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Fetch Report"}
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
                <Typography variant="subtitle2" color="text.secondary">Total Transactions</Typography>
                <Typography variant="h5" fontWeight={700}>{summary.total_transactions || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Sales (Excl VAT)</Typography>
                <Typography variant="h5" fontWeight={700}>${summary.total_sales_excl_vat || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total VAT Amount</Typography>
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

        {/* Transactions Table */}
        {transactions && transactions.length > 0 && (
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Transaction #</TableCell>
                      <TableCell>Item Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total Excl</TableCell>
                      <TableCell>VAT</TableCell>
                      <TableCell>Total Incl</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.id}</TableCell>
                        <TableCell>{t.StoreName}</TableCell>
                        <TableCell>{t.TransactionDate}</TableCell>
                        <TableCell>{t.Transaction_number}</TableCell>
                        <TableCell>{t.Item_Code}</TableCell>
                        <TableCell>{t.Description}</TableCell>
                        <TableCell>{t.Quanity}</TableCell>
                        <TableCell>${t.Price}</TableCell>
                        <TableCell>${t.Total_Excl}</TableCell>
                        <TableCell>${t.VAT_Amount}</TableCell>
                        <TableCell>${t.Total_Incl}</TableCell>
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