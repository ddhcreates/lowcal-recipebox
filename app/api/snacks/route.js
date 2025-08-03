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

    const sheet = doc.sheetsByTitle['Snacks'];
    if (!sheet) {
      return Response.json([], { status: 404 });
    }

    const rows = await sheet.getRows();
    const snacks = rows
      .filter(row => row._rawData[0] && row._rawData[0].trim() !== '')
      .map(row => ({
        name: row._rawData[0] || '',
        calories: row._rawData[1] || '',
        details: row._rawData[2] || '',
        photo: row._rawData[3] || ''
      }));

    return Response.json(snacks);
  } catch (error) {
    console.error('Error fetching snacks:', error);
    return Response.json({ error: 'Failed to fetch snacks' }, { status: 500 });
  }
}