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

    const sheet = doc.sheetsByTitle['Recipes'];
    if (!sheet) {
      return Response.json({ error: 'Recipes sheet not found' }, { status: 404 });
    }

    const rows = await sheet.getRows();
    
    const recipes = rows
      .filter(row => row.get('Recipe Name') && row.get('Recipe Name').trim() !== '')
      .map(row => ({
        name: row.get('Recipe Name') || '',
        protein: extractProtein(row.get('Protein') || ''),
        veggie: determineVeggieStatus(row.get('Veggies') || ''),
        ingredients: row.get('Ingredients') || '',
        steps: row.get('Steps') || '',
        photoLink: row.get('Photo Link') || ''
      }));

    return Response.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return Response.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

function extractProtein(proteinCell) {
  if (!proteinCell) return 'Other';
  
  const proteinText = proteinCell.toString().toLowerCase();
  
  if (proteinText.includes('beef') || proteinText.includes('stew') || proteinText.includes('ground')) {
    return 'Beef';
  } else if (proteinText.includes('pork') || proteinText.includes('bacon') || proteinText.includes('ham')) {
    return 'Pork';
  } else if (proteinText.includes('chicken') || proteinText.includes('poultry')) {
    return 'Chicken';
  } else if (proteinText.includes('fish') || proteinText.includes('salmon') || proteinText.includes('tuna') ||
             proteinText.includes('cod') || proteinText.includes('tilapia')) {
    return 'Fish';
  } else {
    return 'Other';
  }
}

function determineVeggieStatus(veggieCell) {
  if (!veggieCell) return 'false';
  
  const veggieText = veggieCell.toString().toLowerCase();
  
  if (veggieText.includes('n/a') || veggieText.includes('no') ||
      veggieText.includes('none') || veggieText.trim() === '') {
    return 'false';
  }
  
  const commonVeggies = [
    'onion', 'garlic', 'tomato', 'pepper', 'carrot', 'celery', 'spinach',
    'broccoli', 'cauliflower', 'zucchini', 'mushroom', 'lettuce', 'cucumber',
    'bell pepper', 'green beans', 'peas', 'corn', 'potato', 'sweet potato',
    'cabbage', 'kale', 'brussels sprouts', 'asparagus', 'eggplant', 'leek'
  ];
  
  const hasVeggies = commonVeggies.some(veggie => veggieText.includes(veggie));
  return hasVeggies ? 'true' : 'false';
}