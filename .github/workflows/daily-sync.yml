Const fs = require('fs');

// आपका असली Firebase Database URL
const FIREBASE_URL = "https://meena-marriage-default-rtdb.asia-southeast1.firebasedatabase.app/.json";

const blockedKeys = new Set([
  'phone', 'alt_phone', 'mobile', 'contact', 'whatsapp', 
  'father_phone', 'phonelast10', 'verifiedemail', 'email'
]);

const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\d{10,12})/g;

function sanitizeObject(item) {
  if (Array.isArray(item)) {
    return item.map(sanitizeObject);
  } else if (item !== null && typeof item === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(item)) {
      const lowerKey = key.toLowerCase().trim();

      // संवेदनशील फ़ील्ड मिलने पर उसे हटा दें
      if (blockedKeys.has(lowerKey)) {
        continue;
      }

      let value = item[key];

      // identitySignature जैसी स्ट्रिंग्स में मौजूद फ़ोन नंबर को साफ़ करें
      if (lowerKey === 'identitysignature' && typeof value === 'string') {
        value = value.replace(phoneRegex, '[REDACTED]');
      }

      cleanObj[key] = sanitizeObject(value);
    }
    return cleanObj;
  }
  return item;
}

async function runSync() {
  try {
    console.log("Firebase से डेटा फेच हो रहा है...");
    const response = await fetch(FIREBASE_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const rawJson = await response.json();
    const sanitizedData = sanitizeObject(rawJson);

    // क्लीन किए गए डेटा को public_profiles.json में सेव करें
    fs.writeFileSync('public_profiles.json', JSON.stringify(sanitizedData));
    console.log("डेटा सफलतापूर्वक क्लीन होकर सेव हो गया!");
    
  } catch (error) {
    console.error("ऑटो-सिंक में एरर आई:", error);
    process.exit(1);
  }
}

runSync();
