const fs = require('fs');

// Firebase Database URL with Secret Key for Authentication
const FIREBASE_URL = 'https://meena-marriage-default-rtdb.asia-southeast1.firebasedatabase.app/.json?auth=KLEHB8GIs2PxUIobazUAGHsObWz2AT1Gtqjk83tV';

// जिन फील्ड्स को पब्लिक नहीं करना है (सुरक्षा के लिए)
const blockedKeys = new Set([
    'phone', 'alt_phone', 'mobile', 'contact', 'whatsapp', 
    'father_phone', 'phone1to10', 'verifiedemail', 'email'
]);

const phoneRegex = /(?:\+?\d{1,3}[-\s]?)?(?:\d{10,12})/g;

function sanitizeObject(item) {
    if (Array.isArray(item)) {
        return item.map(sanitizeObject);
    } else if (item !== null && typeof item === 'object') {
        const cleanObj = {};
        for (const key of Object.keys(item)) {
            const lowerKey = key.toLowerCase().trim();

            // संवेदनशील फ़ील्ड्स को हटा दें
            if (blockedKeys.has(lowerKey)) {
                continue;
            }

            let value = item[key];

            // identitySignature जैसी फील्ड्स में से नंबर हटाएँ (Redact करें)
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
        console.log('Firebase से डेटा फेच हो रहा है...');
        // Node.js v18+ में fetch इनबिल्ट होता है
        const response = await fetch(FIREBASE_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const rawJson = await response.json();
        const sanitizedData = sanitizeObject(rawJson);

        // क्लीन किए गए डेटा को public_profiles.json में सेव करें
        fs.writeFileSync('public_profiles.json', JSON.stringify(sanitizedData, null, 2));
        console.log("✅ डेटा सफलतापूर्वक क्लीन होकर सेव हो गया!");

    } catch (error) {
        console.error("❌ डेटा सिंक में एरर आई:", error);
        process.exit(1); // एरर आने पर एक्शन को फेल करने के लिए
    }
}

runSync();
