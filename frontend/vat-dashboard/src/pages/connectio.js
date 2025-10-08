import React from 'react';
import {useState, useContext} from 'react';
import axios from "axios";
import {DBContext} from '../context/DBcontext';
import {AppBar, Toolbar, Typography, Container, Paper, TextField, Button, Grid, Snackbar, Alert, Box, Card, CardContent, Avatar, Chip, Divider} from "@mui/material";
import {Calculate, AccountTree, Speed, Security, TrendingUp, CheckCircle, Storage} from "@mui/icons-material";

export default function HomePage() {

    const {connection, updateConnection} = useContext(DBContext);

    const [host, setHost] = useState("");
    const [user, setUser] = useState("");
    const [password, setPassword]  = useState("");
    const [database, setDatabase]  = useState("");
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        if (!host || !user || !password || !database) {
            setSnackMsg("Please fill all the fields");
            setOpenSnack(true);
            return 
        }

        setIsLoading(true);
        setSnackMsg("Attempting connection ...");
        setOpenSnack(true);

        try {
            const response = await axios.post("http://localhost:8000/connect-db", {
                server: host,
                database: database,
                username: user,
                password: password
            });

            setSnackMsg(response.data.message || "Connected Successfully!");
            setIsConnected(true);
        } catch (err) {
            setSnackMsg("Connection failed: " + (err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : err.message));
            setIsConnected(false);
        }

        setIsLoading(false);
        setOpenSnack(true);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
        }}
        >
            {/* Navigation Bar */}
            <AppBar 
                position="static"
                sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backgroundFilter: 'blur(10px)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
                }}
                >
                    <Toolbar>
                        <Avatar sx={{mr: 2, background: '#667eea'}}>
                            <Calculate />
                        </Avatar>
                        <Typography
                            variant="h6"
                            sx={{
                                flexGrow: 1,
                                color: '#333',
                                fontWeight: 600,
                                fontSize: '1.3rem'
                            }}
                        >
                            VAT Management System
                        </Typography>
                        <Chip
                            label="v2.1.0"
                            size="small"
                            sx={{
                                background: "#667eea",
                                color: 'white',
                                fontWeight: 500
                            }}
                        />
                    </Toolbar>
                </AppBar>
                
                {/* Hero Section */}
                <Container maxWidth='lg' sx={{py: 6}}>
                    <Box textAlign="center" sx={{mb: 6}}>
                        <Typography
                            variant="h2"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                mb: 2,
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                fontSize: {xs: '2rem', md: '3rem'}
                            }}
                            >
                                Professional VAT Caluclator
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    mb: 4,
                                    maxWidth: 600,
                                    mx: 'auto',
                                    lineHeight: 1.6 
                                }}
                            >
                                Connect to your RMS database and manage VAT calculations with ease.
                                Fast, secure, and reliable tax management solution.
                            </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {/*Main connection form  */}
                        <Grid item xs={12} md={8}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: '0, 10px, 40px, rgba(0,0,0,0.1)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <CardContent sx={{ p: 4}}>
                                    {/* Card Header */}
                                    <Box display='flex' alignItems="center" mb={3}>
                                        <Storage sx={{ mr: 2, color: '#667eea', fontSize: 28}} />
                                        <Typography variant="h5" sx={{fontWeight: 600, color: '#333'}}>
                                            Database Connection
                                        </Typography>
                                        {isConnected && (
                                            <Chip
                                                icon={<CheckCircle />}
                                                label="Connected"
                                                color="success"
                                                sx={{ ml: 2}}
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{mb: 4}} />

                                    {/*Enhanced Form */}
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Server Host"
                                                placeholder="e.g., localhost:5432"
                                                fullWidth
                                                value={host}
                                                onChange={(e)=> setHost(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root':{
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                                        }
                                                    }
                                                }}
                                                InputProps={{
                                                    startAdornment: <AccountTree sx={{ mr: 1, color:'#666'}} />
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField 
                                                label="username"
                                                fullWidth
                                                value={user}
                                                onChange={(e)=> setUser(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                                        }
                                                    }
                                                }}
                                                />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="password"
                                                type="password"
                                                fullWidth
                                                value={password}
                                                onChange={(e)=> setPassword(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                                        }
                                                    }
                                                }}
                                                />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Database Name"
                                                placeholder="e.g., vat_database"
                                                fullWidth
                                                value={database}
                                                onChange={(e)=> setDatabase(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover': {
                                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                                        }
                                                    }
                                                }}
                                                />
                                        </Grid>
                                    </Grid>

                                    {/*Connect Button */}
                                    <Box mt={4}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            onClick={handleConnect}
                                            disabled={isLoading}
                                            startIcon = {isConnected ? <CheckCircle /> : <AccountTree />}
                                            sx = {{
                                                py:2,
                                                borderRadius: 2,
                                                background: isConnected ? '#2e7d32' : 'linear-gradient(45deg, #667eea, #764ba2)',
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                                '&:hover':{
                                                    transform: isLoading ? 'none' : 'translateY(-2px)',
                                                    boxShadow: isLoading ? '0 4px 15px rgba(102, 126, 234, 0.4)' : '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                }, 
                                                '&:disbaled': {
                                                    background: '#ccc',
                                                    transform: 'none'
                                                }
                                            }}
                                            >
                                                {isLoading ? 'Connecting...':
                                                isConnected ? 'Connected Successfuly': 
                                                'Connect To Database'}
                                            </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Sidebar features */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{display: 'flex', flexDirection: 'row', gap: 3}}>
                            <Card sx={{
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                                
                            }}>
                                <CardContent sx={{textAlign: 'center', p: 3}}>
                                    <Speed sx={{fontSize: 48, color: '#667eea', mb: 1}} />
                                    <Typography variant="h6" sx={{fontWeight: 600, mb:  1}}>
                                        Lighting Fast
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        process thousands of VAT calculations in seconds
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}>
                                <CardContent sx={{textAlign:'center', p: 3}}>
                                    <Security sx={{fontSize: 48, color: '#2e7d32', mb: 2}}/>
                                    <Typography  variant="h6" sx={{fontWeight: 600, mb: 1}}>
                                        Secure & Reliable
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Entreprise-grade security for your financial data
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                transition: 'transfrom 0.2s',
                                '&:hover': {
                                    transfrom: 'translateY(-5px)'
                                } 
                            }}>
                                <CardContent sx={{textAlign: 'center', p: 3}}>
                                    <TrendingUp sx={{ fontSize: '48', color: '#ed6c02', mb: 2}} />
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 1}}>
                                        Smart Analytics
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Get Insihts and reports on your VAT data
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                    </Grid>
                </Container>

               {/* Footer */}
               <Box 
                sx={{
                    mt: 8,
                    py: 3,
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}
                >
                    <Container>
                        <Typography
                            variant="body2"
                            align='center'
                            sx={{color: 'rgba(255,255,255,0.8)'}}
                            >
                                @ 2025 VAT Management System. Built with React & Material-UI
                            </Typography>
                    </Container>
                </Box> 

                <Snackbar
                    open={openSnack}
                    autoHideDuration={5000}
                    onClose={()=> setOpenSnack(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right'}}
                >
                    <Alert
                        severity={isConnected ? "success" : snackMsg.includes("failed") ? "error": "info"}
                        onClose={()=> setOpenSnack(false)}
                        sx={{
                            boderRadius: 2,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                    >
                        {snackMsg}
                    </Alert>
                </Snackbar>
        </Box>
   );
}