import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure you have your DeepL Auth Key set in your environment
const DEEPL_AUTH_KEY = process.env.DEEPL_AUTH_KEY;
// Use api-free.deepl.com for free tier, api.deepl.com for Pro
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

if (!DEEPL_AUTH_KEY) {
  console.error("ERROR: DEEPL_AUTH_KEY environment variable is missing.");
  console.log("Please run this script like: DEEPL_AUTH_KEY='your_key' node scripts/translateWithDeepL.js");
  process.exit(1);
}

const enPath = path.resolve(__dirname, '../src/i18n/locales/en.json');
const huPath = path.resolve(__dirname, '../src/i18n/locales/hu.json');

async function translateText(text, targetLang) {
  // If it's empty or just whitespace, don't translate
  if (!text || text.trim() === '') return text;

  try {
    const response = await axios.post(
      DEEPL_API_URL,
      {
        text: [text],
        target_lang: targetLang,
        source_lang: 'EN',
        // Preserve formatting like {{count}}
        preserve_formatting: true,
        tag_handling: 'xml',
        ignore_tags: ['x'] // Example if we wrap placeholders in <x>
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.translations[0].text;
  } catch (error) {
    console.error(`Error translating text "${text}":`, error.response?.data || error.message);
    return text; // Fallback to original text on error
  }
}

async function processObject(obj, targetLang) {
  const translatedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      console.log(`Translating key: ${key}...`);

      // Basic protection for i18next interpolation variables like {{count}}
      // DeepL sometimes messes these up if not configured, but preserve_formatting helps.
      // A more robust way is to replace them with XML tags before translation and revert after.
      let safeText = value.replace(/\{\{(.*?)\}\}/g, '<keep>$1</keep>');

      let translatedText = await translateText(safeText, targetLang);

      // Revert the tags
      translatedText = translatedText.replace(/<keep>(.*?)<\/keep>/gi, '{{$1}}');

      translatedObj[key] = translatedText;
    } else if (typeof value === 'object' && value !== null) {
      translatedObj[key] = await processObject(value, targetLang);
    } else {
      translatedObj[key] = value;
    }
  }
  return translatedObj;
}

async function main() {
  console.log("Reading English dictionary...");
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  console.log("Starting translation to Hungarian (HU)...");
  const huData = await processObject(enData, 'HU');

  console.log("Saving translated dictionary...");
  fs.writeFileSync(huPath, JSON.stringify(huData, null, 2), 'utf-8');
  console.log("Done! Hungarian dictionary updated successfully.");
}

main().catch(console.error);
