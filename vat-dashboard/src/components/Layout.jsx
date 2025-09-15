// src/components/Layout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, CssBaseline } from "@mui/material";
import { Calculate, Storage, TrendingUp, Speed } from "@mui/icons-material";

const drawerWidth = 240;

export default function Layout() {
  const menuItems = [
    { text: "Home", icon: <Calculate />, path: "/" },
    { text: "VAT Summary", icon: <TrendingUp />, path: "/summary" },
    { text: "Stores", icon: <Storage />, path: "/stores" },
    { text: "VAT Rates", icon: <Speed />, path: "/vat-rates" },
    {text: "VAT Report", icon: <TrendingUp />, path: "/vat-report"},
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "rgba(255,255,255,0.95)", color: "#333" }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            VAT Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", background: "rgba(255,255,255,0.95)" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton component={Link} to={item.path} key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet /> {/* This is where routed pages will render */}
      </Box>
    </Box>
  );
}