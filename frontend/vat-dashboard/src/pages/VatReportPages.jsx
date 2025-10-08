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
import { getVatReport, getDepartments } from "../services/api"; 
import { DBContext } from "../context/DBcontext"; 

export default function VatReportPage() {
  const { connection } = useContext(DBContext);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  // Data
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);
  const [summary, setSummary] = useState({});
  const [departments, setDepartments] = useState([]);

  // Loading and snack
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Load departments on mount
  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await getDepartments();
        setDepartments(res.data.departments || []);
      } catch (err) {
        setSnackMsg("Failed to load departments");
        setSnackOpen(true);
      }
    }
    loadDepartments();
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
        DepartmentID: departmentId || undefined,
      });
      setDepartmentBreakdown(res.data.departments || []);
      setSummary(res.data.summary || {});
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
          VAT Report by Department
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
                  label="Department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ flex: 1 }}
                >
                  <option value="">All Departments</option>
                  {departments && departments.length > 0 && departments.map((dept) => (
                    <option key={dept.DepartmentID} value={dept.DepartmentID}>
                      {dept.DepartmentName}
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
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Sales (Incl VAT)</Typography>
                <Typography variant="h5" fontWeight={700}>
                  ZMW{Number(summary.total_sales_inclusive || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Sales (Excl VAT)</Typography>
                <Typography variant="h5" fontWeight={700}>ZMW{summary.total_sales_exclusive?.toFixed(2) || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total VAT Amount</Typography>
                <Typography variant="h5" fontWeight={700}>ZMW{summary.total_sales_tax?.toFixed(2) || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Vatable</Typography>
                <Typography variant="h5" fontWeight={700}>ZMW{summary.total_vatable?.toFixed(2) || 0}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                <Typography variant="subtitle2" color="text.secondary">Total Non-Vatable</Typography>
                <Typography variant="h5" fontWeight={700}>ZMW{summary.total_non_vatable?.toFixed(2) || 0}</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Departments Table */}
        {departmentBreakdown && departmentBreakdown.length > 0 && (
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Department Breakdown
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#667eea' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Department</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sales (Incl)</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sales (Excl)</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Sales Tax</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Vatable</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Non-Vatable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentBreakdown.map((dept, idx) => (
                      <TableRow 
                        key={idx} 
                        hover
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(102, 126, 234, 0.05)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, fontSize: 15 }}>{dept.DepartmentName}</TableCell>
                        <TableCell align="right" sx={{ fontSize: 15 }}>
                          ZMW{Number(dept.SalesInclusive || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 15 }}>
                          ZMW{Number(dept.SalesExclusive || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 15 }}>
                          ZMW{Number(dept.SalesTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 15 }}>
                          ZMW{Number(dept.Vatable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 15 }}>
                          ZMW{Number(dept.NonVatable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {!isLoading && departmentBreakdown.length === 0 && startDate && endDate && (
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No data available for the selected date range and department.
            </Typography>
          </Card>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
        <Alert severity="info" onClose={() => setSnackOpen(false)}>{snackMsg}</Alert>
      </Snackbar>
    </Box>
  );
}