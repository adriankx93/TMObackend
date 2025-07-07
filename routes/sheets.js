const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const CONFIG = {
  ranges: {
    technicians: 'C7:E23',
    dates: 'J3:AM3',
    shifts: 'J7:AM23',
  },
  monthNames: [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ],
  shiftCodes: {
    firstShift: '1',
    day: 'd',
    night: 'n',
    vacation: 'u',
    sickLeave: 'l4',
  }
};

const _fetchFromSheets = async (url, errorMessagePrefix) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `${errorMessagePrefix}: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage += ` - ${errorData.error.message}`;
      }
    } catch {
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
};

// Endpoint GET /api/sheets/current-month
router.get('/current-month', async (req, res) => {
  try {
    const now = new Date();
    const monthIndex = now.getMonth();
    const year = now.getFullYear();
    const expectedSheetName = CONFIG.monthNames[monthIndex];

    // 1) List of sheets
    const listUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${SHEETS_API_KEY}`;
    const allSheetsResp = await _fetchFromSheets(listUrl, 'Nie udało się pobrać listy arkuszy');
    const allSheets = allSheetsResp.sheets.map(s => s.properties.title.trim());
    const sheetName = allSheets.find(
      name => name.toLowerCase() === expectedSheetName.toLowerCase()
    );
    if (!sheetName) {
      return res.status(400).json({ error: `Nie znaleziono arkusza "${expectedSheetName}".` });
    }

    // 2) Pobranie danych
    const rangesQuery = Object.values(CONFIG.ranges)
      .map(r => `ranges=${encodeURIComponent(sheetName)}!${r}`)
      .join('&');
    const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${rangesQuery}&key=${SHEETS_API_KEY}`;
    const dataResp = await _fetchFromSheets(dataUrl, 'Błąd pobierania zakresów');

    const [techniciansData, datesData, shiftsData] = dataResp.valueRanges.map(r => r.values || []);
    const dates = datesData[0];

    // 3) Parsowanie techników
    const technicians = techniciansData
      .map((row, i) => {
        if (!row[0] || !row[1]) return null;
        return {
          id: i,
          shiftRowIndex: i,
          firstName: row[0].trim(),
          lastName: row[1].trim(),
          role: row[2] ? row[2].trim() : ""
        };
      })
      .filter(Boolean);

    // 4) Zwrot danych
    res.json({
      month: sheetName,
      year,
      technicians,
      dates,
      shifts: shiftsData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
