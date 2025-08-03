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

    const sheet = doc.sheetsByTitle['Prompts'];
    if (!sheet) {
      return Response.json(['Prompts sheet not found'], { status: 404 });
    }

    const rows = await sheet.getRows();
    const prompts = rows
      .map(row => row.get('Prompt') || row._rawData[0]) // Try 'Prompt' column or first column
      .filter(prompt => prompt && prompt.trim() !== '');

    return Response.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return Response.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}