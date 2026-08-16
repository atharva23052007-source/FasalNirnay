import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    brandName: 'FasalNirnay',
    brandTagline: 'AI Crop Decision Engine',
    navDashboard: 'Dashboard',
    navMyLots: 'My Lots',
    navMarketPrices: 'Market Prices',
    navStorageLocator: 'Storage Locator',
    navOrders: 'Orders',
    navReports: 'Reports',
    hiFarmer: 'Hi, Farmer',

    // Hero
    goodMorning: 'Good Morning, Farmer!',
    heroSubtitle1: 'Get the best value for your harvest',
    heroSubtitle2: '— in one place.',
    heroDesc: 'AI-driven recommendations to sell smarter\nand order what you need.',
    partlyCloudy: 'Partly Cloudy',
    locationNashik: 'Nashik, Maharashtra',

    // Market Overview
    marketTitle: "Today's Market Overview",
    sourceAgmarknet: 'Source: AGMARKNET',
    modalPrice: 'Modal Price',
    vsYesterday: 'vs yesterday',
    arrivalQty: 'Arrival Quantity (Today)',
    tomato: 'Tomato',
    onion: 'Onion',
    leafyVegetables: 'Leafy Vegetables',

    // Today's Best Actions
    bestActionsTitle: "Today's Best Actions",
    bestActionsSubtitle: 'AI suggests the best action to get you maximum profit.',
    whyTheseActions: 'Why these actions?',
    harvested: 'Harvested',
    aiSays: 'AI SAYS',
    sellBy: 'Sell by',
    sellToday: 'Sell today',
    processToday: 'Process today',
    morning: 'Morning',
    evening: 'Evening',
    afternoon: 'Afternoon',
    why: 'Why?',
    seeDetails: 'See Details',

    // Crop Actions
    tomatoAction: 'WAIT 2 DAYS',
    tomatoBenefit: 'You may earn ₹1,850 more',
    tomatoRationale: 'Price is expected to rise and your crop can safely wait.',
    
    onionAction: 'SELL TODAY',
    onionBenefit: 'Best price available now',
    onionRationale: 'Prices may drop tomorrow and spoilage risk will increase.',

    leafyAction: 'PROCESS TODAY',
    leafyBenefit: 'Spoilage risk is high',
    leafyRationale: 'Crop spoils fast and value reduces quickly.',

    // Sell Channels
    sellProduceTitle: 'Sell Your Produce – Reach More Buyers',
    viewAllChannels: 'View All Channels',
    sellOnBlinkit: 'Sell on Blinkit',
    sellOnSwiggy: 'Sell on Swiggy',
    sellOnMandi: 'Sell on Mandi',
    sellDirect: 'Sell Direct',

    // Modals
    close: 'Close',
    spoilageRisk: 'Spoilage Risk',
    shelfLife: 'Shelf Life',
    currentPrice: 'Current Price',
    expectedPrice: 'Expected Price',
    costsBreakdown: 'Costs Breakdown',
    expectedNetIncome: 'Expected Net Outcome',
    confirmAction: 'Confirm Action',
  },
  hi: {
    // Nav
    brandName: 'फ़सलनिर्णय',
    brandTagline: 'एआई फसल निर्णय इंजन',
    navDashboard: 'डैशबोर्ड',
    navMyLots: 'मेरे लॉट',
    navMarketPrices: 'बाजार भाव',
    navStorageLocator: 'कोल्ड स्टोरेज लोकेटर',
    navOrders: 'ऑर्डर',
    navReports: 'रिपोर्ट्स',
    hiFarmer: 'नमस्ते, किसान',

    // Hero
    goodMorning: 'शुभ प्रभात, किसान भाई! ☀️',
    heroSubtitle1: 'अपनी उपज का सर्वश्रेष्ठ मूल्य प्राप्त करें',
    heroSubtitle2: '— एक ही स्थान पर।',
    heroDesc: 'स्मार्ट बिक्री के लिए एआई-संचालित सिफारिशें।',
    partlyCloudy: 'आंशिक रूप से बादल',
    locationNashik: 'नासिक, महाराष्ट्र',

    // Market Overview
    marketTitle: 'आज की मंडी रिपोर्ट',
    sourceAgmarknet: 'स्रोत: एगमार्कनेट',
    modalPrice: 'मॉडल मूल्य',
    vsYesterday: 'कल की तुलना में',
    arrivalQty: 'आवक मात्रा (आज)',
    tomato: 'टमाटर',
    onion: 'प्याज',
    leafyVegetables: 'हरी पत्तेदार सब्जियां',

    // Today's Best Actions
    bestActionsTitle: 'आज के सर्वोत्तम उपाय',
    bestActionsSubtitle: 'अधिकतम लाभ दिलाने के लिए एआई की सर्वश्रेष्ठ सलाह।',
    whyTheseActions: 'ये सुझाव क्यों?',
    harvested: 'कटाई की तिथि',
    aiSays: 'एआई की सलाह',
    sellBy: 'बेचने की तिथि',
    sellToday: 'आज ही बेचें',
    processToday: 'आज ही प्रोसेसिंग करें',
    morning: 'सुबह',
    evening: 'शाम',
    afternoon: 'दोपहर',
    why: 'कारण?',
    seeDetails: 'विवरण देखें',

    // Crop Actions
    tomatoAction: '2 दिन प्रतीक्षा करें',
    tomatoBenefit: 'आप ₹1,850 अधिक कमा सकते हैं',
    tomatoRationale: 'कीमत बढ़ने की उम्मीद है और आपकी फसल सुरक्षित रह सकती है।',
    
    onionAction: 'आज ही बेचें',
    onionBenefit: 'वर्तमान में सर्वोत्तम मूल्य उपलब्ध है',
    onionRationale: 'कल कीमतें गिर सकती हैं और खराब होने का जोखिम बढ़ जाएगा।',

    leafyAction: 'आज ही प्रोसेसिंग करें',
    leafyBenefit: 'खराब होने का उच्च जोखिम',
    leafyRationale: 'फसल तेजी से खराब होती है और मूल्य घटता है।',

    // Sell Channels
    sellProduceTitle: 'अपनी फसल बेचें – अधिक खरीदारों तक पहुंचें',
    viewAllChannels: 'सभी चैनल देखें',
    sellOnBlinkit: 'ब्लिंकिट पर बेचें',
    sellOnSwiggy: 'स्वीगी पर बेचें',
    sellOnMandi: 'मंडी पर बेचें',
    sellDirect: 'सीधे बेचें',

    // Modals
    close: 'बंद करें',
    spoilageRisk: 'खराब होने का जोखिम',
    shelfLife: 'शेल्फ लाइफ',
    currentPrice: 'वर्तमान दर',
    expectedPrice: 'अनुमानित दर',
    costsBreakdown: 'लागत का विवरण',
    expectedNetIncome: 'अपेक्षित शुद्ध आय',
    confirmAction: 'पुष्टि करें',
  },
  mr: {
    // Nav
    brandName: 'फसलनिर्णय',
    brandTagline: 'एआय पीक निर्णय इंजिन',
    navDashboard: 'डॅशबोर्ड',
    navMyLots: 'माझे लॉट्स',
    navMarketPrices: 'बाजार भाव',
    navStorageLocator: 'कोल्ड स्टोरेज शोध',
    navOrders: 'ऑर्डर्स',
    navReports: 'अहवाल',
    hiFarmer: 'नमस्कार, शेतकरी',

    // Hero
    goodMorning: 'शुभ सकाळ, शेतकरी मित्र! ☀️',
    heroSubtitle1: 'तुमच्या पिकाला मिळवा उत्तम भाव',
    heroSubtitle2: '— एकाच ठिकाणी.',
    heroDesc: 'स्मार्ट विक्रीसाठी एआय-आधारित शिफारसी.',
    partlyCloudy: 'अंशतः ढगाळ',
    locationNashik: 'नाशिक, महाराष्ट्र',

    // Market Overview
    marketTitle: 'आजचा बाजार अहवाल',
    sourceAgmarknet: 'स्रोत: ॲगमार्कनेट',
    modalPrice: 'सरासरी दर',
    vsYesterday: 'कालच्या तुलनेत',
    arrivalQty: 'आजची आवक (MT)',
    tomato: 'टोमॅटो',
    onion: 'कांदा',
    leafyVegetables: 'पालक व पालेभाज्या',

    // Today's Best Actions
    bestActionsTitle: 'आजच्या सर्वोत्तम कृती',
    bestActionsSubtitle: 'जास्तीत जास्त नफ्यासाठी एआयची सर्वोत्तम शिफारस.',
    whyTheseActions: 'या शिफारसी का?',
    harvested: 'काढणी दिनांक',
    aiSays: 'एआय सल्ला',
    sellBy: 'विक्रीची मुदत',
    sellToday: 'आजच विका',
    processToday: 'आजच प्रक्रिया करा',
    morning: 'सकाळी',
    evening: 'संध्याकाळी',
    afternoon: 'दुपारी',
    why: 'का?',
    seeDetails: 'तपशील पहा',

    // Crop Actions
    tomatoAction: '२ दिवस थांबा',
    tomatoBenefit: 'तुम्हाला ₹१,८५० जास्त मिळू शकतात',
    tomatoRationale: 'दर वाढण्याची शक्यता आहे आणि पीक सुरक्षित राहू शकते.',
    
    onionAction: 'आजच विका',
    onionBenefit: 'सध्या उत्तम दर उपलब्ध आहे',
    onionRationale: 'उद्या दर घसरू शकतात आणि नुकसान वाढू शकते.',

    leafyAction: 'आजच प्रक्रिया करा',
    leafyBenefit: 'खराब होण्याचा धोका जास्त',
    leafyRationale: 'पालेभाज्या लवकर खराब होतात व मूल्य कमी होते.',

    // Sell Channels
    sellProduceTitle: 'तुमचा माल विका – अधिक ग्राहकांपर्यंत पोहोचा',
    viewAllChannels: 'सर्व मार्ग पहा',
    sellOnBlinkit: 'ब्लिंकिटवर विका',
    sellOnSwiggy: 'स्वगीवर विका',
    sellOnMandi: 'मार्केट यार्डात विका',
    sellDirect: 'थेट विका',

    // Modals
    close: 'बंद करा',
    spoilageRisk: 'नुकसान धोका',
    shelfLife: 'टिकाऊपणा',
    currentPrice: 'सध्याचा दर',
    expectedPrice: 'अपेक्षित दर',
    costsBreakdown: 'खर्च तपशील',
    expectedNetIncome: 'अपेक्षित निव्वळ नफा',
    confirmAction: 'शिफारस स्वीकारा',
  }
};
