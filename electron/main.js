// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load React build
  win.loadFile(path.join(__dirname, '../frontend/vat-dashboard/build/index.html'));

  // Open DevTools to see errors
  win.webContents.openDevTools();
}

// Start backend and wait until it's ready
function startBackendAndWait() {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, '../backend/dist/main.exe');
    const backend = spawn(backendPath);
    backend.stdout.on('data', (data) => console.log(`BACKEND: ${data}`));
    backend.stderr.on('data', (data) => console.error(`BACKEND ERROR: ${data}`));

    // Wait for backend to respond
    const checkBackend = async () => {
      try {
        await axios.get('http://127.0.0.1:8000'); // use your backend URL
        resolve();
      } catch (err) {
        setTimeout(checkBackend, 500);
      }
    };
    checkBackend();
  });
}

app.whenReady().then(async () => {
  await startBackendAndWait();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});