// src/pages/StoresPage.jsx
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
import { Storage } from "@mui/icons-material";
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
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 4 }}>
          Stores
        </Typography>

        {/* Stores Grid */}
        <Grid container spacing={3}>
          {stores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store.ID}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Storage sx={{ color: "#667eea", mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {store.Name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ID:</strong> {store.ID}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Branch:</strong> {store.BranchNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tax Code:</strong> {store.TaxCode || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {stores.length === 0 && !isLoading && (
            <Typography variant="body1" color="white" sx={{ mt: 4 }}>
              No stores found.
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