// src/pages/StoresPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert
} from "@mui/material";
import { getStores } from "../services/api";
import { DBContext } from "../context/DBcontext";

export default function StoresPage() {
  const { connection } = useContext(DBContext);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  useEffect(() => {
    async function fetchStores() {
      setIsLoading(true);
      try {
        const res = await getStores();
        setStores(res.data.stores);
      } catch (err) {
        setSnackMsg("Failed to load stores");
        setSnackOpen(true);
      }
      setIsLoading(false);
    }

    fetchStores();
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
          Stores
        </Typography>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Branch</strong></TableCell>
                <TableCell><strong>Tax Code</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.ID} hover>
                  <TableCell>{store.ID}</TableCell>
                  <TableCell>{store.Name}</TableCell>
                  <TableCell>{store.BranchNumber || "N/A"}</TableCell>
                  <TableCell>{store.TaxCode || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {stores.length === 0 && !isLoading && (
          <Typography
            variant="body1"
            color="white"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No stores found.
          </Typography>
        )}
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