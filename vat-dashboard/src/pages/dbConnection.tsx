import React from 'react';
import {Container , Paper, Typography, Button} from "@mui/material";

export default function DbConnection() {
    return (
        <Container maxWidth="sm" style={{marginTop: "50px"}}>
            <Paper style={{padding: "20px"}}>
                <Typography variant="h5" gutterBottom>
                    Welcome To VAT program 
                </Typography>
                <Button variant="contained" color="primary">
                    Connect To Database
                </Button>
            </Paper>
        </Container>
    )
}