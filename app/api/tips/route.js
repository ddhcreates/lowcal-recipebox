import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export async function GET() {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Tips'];
    if (!sheet) {
      return Response.json(['Tips sheet not found'], { status: 404 });
    }

    const rows = await sheet.getRows();
    const tips = rows
      .map(row => row.get('Tip') || row._rawData[0]) // Try 'Tip' column or first column
      .filter(tip => tip && tip.trim() !== '');

    return Response.json(tips);
  } catch (error) {
    console.error('Error fetching tips:', error);
    return Response.json({ error: 'Failed to fetch tips' }, { status: 500 });
  }
}