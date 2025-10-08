// src/pages/SalesDashboardPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
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
} from "@mui/material";
import { getDepartments } from "../services/api";
import { DBContext } from "../context/DBcontext";

export default function SalesDashboardPage() {
  const { connection } = useContext(DBContext);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Load departments on mount
  useEffect(() => {
    async function loadDepartments() {
      setIsLoading(true);
      try {
        const res = await getDepartments();
        setDepartments(res.data.departments || []);
      } catch (err) {
        setSnackMsg("Failed to load departments");
        setSnackOpen(true);
        console.error("Error loading departments:", err);
      }
      setIsLoading(false);
    }
    loadDepartments();
  }, [connection]);

  // Calculate totals
  const totals = departments.reduce((acc, dept) => {
    acc.StockOnHandCost += dept.StockOnHandCost || 0;
    acc.CostOfSales += dept.CostOfSales || 0;
    acc.SalesExclusive += dept.SalesExclusive || 0;
    acc.SalesInclusive += dept.SalesInclusive || 0;
    acc.GrossProfitValue += dept.GrossProfitValue || 0;
    return acc;
  }, {
    StockOnHandCost: 0,
    CostOfSales: 0,
    SalesExclusive: 0,
    SalesInclusive: 0,
    GrossProfitValue: 0
  });

  // Calculate overall GP% and Sales Contribution should be 100%
  const overallGPPercent = totals.SalesExclusive > 0 
    ? (totals.GrossProfitValue / totals.SalesExclusive * 100).toFixed(2)
    : 0;

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="xl">
        {/* Page Title */}
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          Department Sales Analysis
        </Typography>

        {/* Snackbar */}
        <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}>
          <Alert severity="error" onClose={() => setSnackOpen(false)}>
            {snackMsg}
          </Alert>
        </Snackbar>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: 'white' }} size={60} />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 3, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
            <CardContent>
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#667eea' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Department Name
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Stock on Hand (Cost)
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Cost of Sales
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Sales Exclusive
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Sales Inclusive
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Gross Profit Value
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Gross Profit %
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        Sales Contribution %
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.map((dept, idx) => (
                      <TableRow 
                        key={dept.DepartmentID} 
                        hover 
                        sx={{ backgroundColor: idx % 2 === 0 ? 'rgba(102, 126, 234, 0.07)' : 'inherit' }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{dept.DepartmentName}</TableCell>
                        <TableCell align="right">
                          {dept.StockOnHandCost?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                        </TableCell>
                        <TableCell align="right">
                          {dept.CostOfSales?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                        </TableCell>
                        <TableCell align="right">
                          {dept.SalesExclusive?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                        </TableCell>
                        <TableCell align="right">
                          {dept.SalesInclusive?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                        </TableCell>
                        <TableCell align="right">
                          {dept.GrossProfitValue?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
                        </TableCell>
                        <TableCell align="right">
                          {dept.GrossProfitPercent?.toFixed(2) || '0.00'}%
                        </TableCell>
                        <TableCell align="right">
                          {dept.SalesContributionPercent?.toFixed(2) || '0.00'}%
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals Row */}
                    {departments.length > 0 && (
                      <TableRow sx={{ backgroundColor: '#764ba2', '&:hover': { backgroundColor: '#764ba2 !important' } }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          TOTAL
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {totals.StockOnHandCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {totals.CostOfSales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {totals.SalesExclusive.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {totals.SalesInclusive.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {totals.GrossProfitValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          {overallGPPercent}%
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                          100.00%
                        </TableCell>
                      </TableRow>
                    )}

                    {departments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          No department data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}