// src/pages/SalesDashboardPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import {
  TrendingUp,
  CalendarToday,
  Store,
  AttachMoney,
} from "@mui/icons-material";
import { getSalesDashboard, getDepartments } from "../services/api";
import { DBContext } from "../context/DBcontext";

export default function SalesDashboardPage() {
  const { connection } = useContext(DBContext);
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState("monthly"); // monthly or yearly

  // Data
  const [summary, setSummary] = useState({});
  const [bestDay, setBestDay] = useState({});
  const [bestDepartment, setBestDepartment] = useState({});
  const [dailyByDepartment, setDailyByDepartment] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);

  // Generate years dropdown (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      let startDate, endDate;

      if (viewType === "monthly") {
        // Get first and last day of selected month
        startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      } else {
        // Get full year
        startDate = `${selectedYear}-01-01`;
        endDate = `${selectedYear}-12-31`;
      }

      console.log("Fetching dashboard with dates:", startDate, endDate);
      const res = await getSalesDashboard({
        start_date: startDate,
        end_date: endDate,
      });

      console.log("Dashboard response:", res.data);
      setSummary(res.data.summary || {});
      setBestDay(res.data.best_day || {});
      setBestDepartment(res.data.best_department || {});
      setDailyByDepartment(res.data.daily_by_department || []);
      setDepartmentSummary(res.data.department_summary || []);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to fetch dashboard data";
      setSnackMsg(`Error: ${errorMsg}`);
      setSnackOpen(true);
      console.error("Dashboard error:", err);
      console.error("Error response:", err.response);
    }
    setIsLoading(false);
  };

  // Transform data into table format (Departments as rows, Dates as columns)
  const transformToTableData = () => {
    if (!dailyByDepartment || dailyByDepartment.length === 0) return { dates: [], departments: [], data: {} };

    // Get unique dates and departments
    const dates = [...new Set(dailyByDepartment.map(item => item.SaleDate))].sort();
    const departments = [...new Set(dailyByDepartment.map(item => item.DepartmentName))].sort();

    // Create data object: data[department][date] = sales
    const data = {};
    dailyByDepartment.forEach(item => {
      if (!data[item.DepartmentName]) {
        data[item.DepartmentName] = {};
      }
      data[item.DepartmentName][item.SaleDate] = item.DailySales || 0;
    });

    return { dates, departments, data };
  };

  const tableData = transformToTableData();

  // Calculate row totals (total per department)
  const calculateRowTotals = () => {
    const totals = {};
    tableData.departments.forEach(dept => {
      totals[dept] = tableData.dates.reduce((sum, date) => {
        return sum + (tableData.data[dept]?.[date] || 0);
      }, 0);
    });
    return totals;
  };

  // Calculate column totals (total per date)
  const calculateColumnTotals = () => {
    const totals = {};
    tableData.dates.forEach(date => {
      totals[date] = tableData.departments.reduce((sum, dept) => {
        return sum + (tableData.data[dept]?.[date] || 0);
      }, 0);
    });
    return totals;
  };

  const rowTotals = calculateRowTotals();
  const columnTotals = calculateColumnTotals();
  const grandTotal = Object.values(rowTotals).reduce((sum, val) => sum + val, 0);

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          Sales Dashboard - Daily by Department
        </Typography>

        {/* Snackbar */}
        <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}>
          <Alert severity="error" onClose={() => setSnackOpen(false)}>
            {snackMsg}
          </Alert>
        </Snackbar>

        {/* Filter Section */}
        <Box mb={4}>
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", p: 3 }}>
            <CardContent>
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
                <TextField
                  select
                  label="View Type"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="monthly">Monthly View</MenuItem>
                  <MenuItem value="yearly">Yearly View</MenuItem>
                </TextField>

                {viewType === "monthly" && (
                  <TextField
                    select
                    label="Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ flex: 1 }}
                  >
                    {months.map(month => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <TextField
                  select
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  sx={{ flex: 1 }}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  sx={{ py: 2, px: 4, background: "linear-gradient(45deg, #667eea, #764ba2)" }}
                  onClick={fetchDashboard}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Fetch Data"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: 'white' }} size={60} />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && Object.keys(summary).length > 0 && (
              <>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <AttachMoney sx={{ fontSize: 40, color: '#667eea' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Total Sales</Typography>
                          <Typography variant="h5" fontWeight={700}>
                            ZMW{summary.total_sales_incl?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg Daily: ZMW{summary.avg_daily_sales?.toLocaleString() || 0}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <CalendarToday sx={{ fontSize: 40, color: '#10b981' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Best Sales Day</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {bestDay.date ? new Date(bestDay.date).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Sales: ZMW{bestDay.sales?.toLocaleString() || 0}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Store sx={{ fontSize: 40, color: '#f59e0b' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Best Department</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {bestDepartment.name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Sales: ZMW{bestDepartment.sales?.toLocaleString() || 0}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, p: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <TrendingUp sx={{ fontSize: 40, color: '#ef4444' }} />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Trading Days</Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {summary.trading_days || 0}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Transactions: {summary.total_transactions || 0}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Daily Sales by Department Table */}
                {tableData.departments.length > 0 && (
                  <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", mb: 4 }}>
                    <CardContent>
                      <Typography variant="h5" fontWeight={700} mb={3}>
                        Daily Sales by Department
                      </Typography>
                      <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 800 }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#667eea' }}>
                              <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                minWidth: 180,
                                position: 'sticky', 
                                left: 0, 
                                backgroundColor: '#667eea', 
                                zIndex: 10,
                                borderRight: '2px solid white',
                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                              }}>
                                Department
                              </TableCell>
                              {tableData.dates.map((date, idx) => (
                                <TableCell 
                                  key={idx} 
                                  align="center" 
                                  sx={{ 
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    fontSize: '0.9rem', 
                                    minWidth: 110,
                                    whiteSpace: 'nowrap',
                                    padding: '12px 8px'
                                  }}
                                >
                                  {new Date(date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: '2-digit'
                                  })}
                                </TableCell>
                              ))}
                              <TableCell align="center" sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                minWidth: 130,
                                position: 'sticky', 
                                right: 0, 
                                backgroundColor: '#667eea', 
                                zIndex: 10,
                                borderLeft: '2px solid white',
                                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
                              }}>
                                Total
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tableData.departments.map((dept, idx) => (
                              <TableRow 
                                key={dept} 
                                hover 
                                sx={{ backgroundColor: idx % 2 === 0 ? 'rgba(102, 126, 234, 0.07)' : 'inherit' }}
                              >
                                <TableCell sx={{ 
                                  fontWeight: 600, 
                                  fontSize: '0.95rem',
                                  position: 'sticky', 
                                  left: 0, 
                                  backgroundColor: idx % 2 === 0 ? 'rgba(102, 126, 234, 0.07)' : 'white', 
                                  zIndex: 9,
                                  borderRight: '1px solid #e0e0e0',
                                  boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
                                }}>
                                  {dept}
                                </TableCell>
                                {tableData.dates.map((date, dateIdx) => (
                                  <TableCell key={dateIdx} align="right" sx={{ padding: '8px' }}>
                                    ZMW {(tableData.data[dept]?.[date] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                ))}
                                <TableCell align="right" sx={{ 
                                  fontWeight: 700, 
                                  color: '#667eea',
                                  fontSize: '0.95rem',
                                  position: 'sticky', 
                                  right: 0, 
                                  backgroundColor: idx % 2 === 0 ? 'rgba(102, 126, 234, 0.07)' : 'white', 
                                  zIndex: 9,
                                  borderLeft: '1px solid #e0e0e0',
                                  boxShadow: '-2px 0 5px rgba(0,0,0,0.05)'
                                }}>
                                  ZMW {rowTotals[dept]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            ))}

                            {/* Totals Row */}
                            <TableRow sx={{ backgroundColor: '#764ba2', '&:hover': { backgroundColor: '#764ba2 !important' } }}>
                              <TableCell sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                position: 'sticky', 
                                left: 0, 
                                backgroundColor: '#764ba2', 
                                zIndex: 10,
                                borderRight: '2px solid white',
                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                              }}>
                                TOTAL
                              </TableCell>
                              {tableData.dates.map((date, idx) => (
                                <TableCell key={idx} align="right" sx={{ color: 'white', fontWeight: 'bold', padding: '12px 8px' }}>
                                  ZMW {columnTotals[date]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                              ))}
                              <TableCell align="right" sx={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1.1rem', 
                                position: 'sticky', 
                                right: 0, 
                                backgroundColor: '#764ba2', 
                                zIndex: 10,
                                borderLeft: '2px solid white',
                                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)'
                              }}>
                                ZMW {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}

                {/* No Data Message */}
                {tableData.departments.length === 0 && (
                  <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No sales data available for the selected period.
                    </Typography>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}