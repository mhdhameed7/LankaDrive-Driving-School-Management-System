import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initializeDatabase, handleIpcRequests } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and IPC
initializeDatabase();
handleIpcRequests(ipcMain);

// IPC Handler for PDF printing
ipcMain.handle('print-to-pdf', async (event, options = {}) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  try {
    const data = await webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      landscape: options.landscape || false,
    });
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Save PDF',
      defaultPath: options.defaultName || 'report.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });
    if (filePath) {
      await fs.promises.writeFile(filePath, data);
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    console.error('Failed to print to PDF:', error);
    return { success: false, error: error.message };
  }
});


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Check if we are running in development mode
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev) {
    // In dev, load Vite's dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools automatically in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
