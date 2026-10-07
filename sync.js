const fs = require('fs');

// Firebase Database URL with Secret Key
const FIREBASE_URL = 'https://meena-marriage-default-rtdb.asia-southeast1.firebasedatabase.app/.json?auth=KLEHB8GIs2PxUIobazUAGHsObWz2AT1Gtqjk83tV';

// जिन फील्ड्स को पब्लिक नहीं करना है (सुरक्षा के लिए)
const blockedKeys = new Set([
    'phone', 'alt_phone', 'mobile', 'contact', 'whatsapp', 
    'father_phone', 'phone1to10', 'verifiedemail', 'email'
]);

const phoneRegex = /(?:\+?\d{1,3}[-\s]?)?(?:\d{10,12})/g;

// डेटा क्लीन करने का फंक्शन
function sanitizeObject(item) {
    if (Array.isArray(item)) {
        return item.map(sanitizeObject);
    } else if (item !== null && typeof item === 'object') {
        const cleanObj = {};
        for (const key of Object.keys(item)) {
            const lowerKey = key.toLowerCase().trim();

            // नंबर और ईमेल पूरी तरह हटा दें
            if (blockedKeys.has(lowerKey)) {
                continue;
            }

            let value = item[key];

            // अगर कहीं टेक्स्ट में नंबर छिपा हो तो उसे छिपा दें
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
        const response = await fetch(FIREBASE_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const rawJson = await response.json();

        // 🔴 मास्टर स्ट्रोक: फालतू डेटा और लॉग्स को रोकें, सिर्फ असली प्रोफाइल्स लें 🔴
        const allowedFolders = ['profiles', 'profiles_v100', 'profiles_v10_final', 'profiles_v200', 'profiles_v300'];
        const filteredData = {};

        for (let folder of allowedFolders) {
            if (rawJson[folder]) {
                filteredData[folder] = rawJson[folder];
            }
        }

        // अब सिर्फ चुने हुए साफ डेटा में से नंबर हटाएँ (Sanitize)
        const sanitizedData = sanitizeObject(filteredData);

        // एकदम साफ सुथरा डेटा सेव करें
        fs.writeFileSync('public_profiles.json', JSON.stringify(sanitizedData, null, 2));
        console.log("✅ डेटा सफलतापूर्वक फिल्टर और क्लीन होकर सेव हो गया!");

    } catch (error) {
        console.error("❌ डेटा सिंक में एरर आई:", error);
        process.exit(1); 
    }
}

runSync();
