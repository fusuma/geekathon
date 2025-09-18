// Translation utilities for ingredients and product data
export interface TranslationConfig {
  from: string;
  to: string;
  market: string;
}

// Common ingredient translations
const INGREDIENT_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Portuguese to English
  'PT-EN': {
    'açúcar': 'sugar',
    'sal': 'salt',
    'óleo': 'oil',
    'água': 'water',
    'farinha': 'flour',
    'leite': 'milk',
    'ovo': 'egg',
    'manteiga': 'butter',
    'queijo': 'cheese',
    'carne': 'meat',
    'frango': 'chicken',
    'peixe': 'fish',
    'tomate': 'tomato',
    'cebola': 'onion',
    'alho': 'garlic',
    'pimenta': 'pepper',
    'limão': 'lemon',
    'laranja': 'orange',
    'maçã': 'apple',
    'banana': 'banana',
    'arroz': 'rice',
    'feijão': 'beans',
    'batata': 'potato',
    'cenoura': 'carrot',
    'espinafre': 'spinach',
    'alface': 'lettuce',
    'preservantes': 'preservatives',
    'corantes': 'colorants',
    'aromatizantes': 'flavorings',
    'conservantes': 'preservatives',
    'estabilizantes': 'stabilizers',
    'emulsificantes': 'emulsifiers',
    'espessantes': 'thickeners',
    'acidulantes': 'acidulants',
    'antioxidantes': 'antioxidants',
    'edulcorantes': 'sweeteners',
    'realçadores de sabor': 'flavor enhancers',
    'glicose': 'glucose',
    'frutose': 'fructose',
    'lactose': 'lactose',
    'glúten': 'gluten',
    'soja': 'soy',
    'amendoim': 'peanut',
    'castanha': 'nuts',
    'amêndoa': 'almond',
    'avelã': 'hazelnut',
    'noz': 'walnut',
    'sésamo': 'sesame',
    'mostarda': 'mustard',
    'aipo': 'celery',
    'sulfitos': 'sulfites',
  },
  // Spanish to English
  'ES-EN': {
    'azúcar': 'sugar',
    'sal': 'salt',
    'aceite': 'oil',
    'agua': 'water',
    'harina': 'flour',
    'leche': 'milk',
    'huevo': 'egg',
    'mantequilla': 'butter',
    'queso': 'cheese',
    'carne': 'meat',
    'pollo': 'chicken',
    'pescado': 'fish',
    'tomate': 'tomato',
    'cebolla': 'onion',
    'ajo': 'garlic',
    'pimienta': 'pepper',
    'limón': 'lemon',
    'naranja': 'orange',
    'manzana': 'apple',
    'plátano': 'banana',
    'arroz': 'rice',
    'frijoles': 'beans',
    'patata': 'potato',
    'zanahoria': 'carrot',
    'espinaca': 'spinach',
    'lechuga': 'lettuce',
    'conservantes': 'preservatives',
    'colorantes': 'colorants',
    'aromatizantes': 'flavorings',
    'estabilizantes': 'stabilizers',
    'emulsionantes': 'emulsifiers',
    'espesantes': 'thickeners',
    'acidulantes': 'acidulants',
    'antioxidantes': 'antioxidants',
    'edulcorantes': 'sweeteners',
    'potenciadores de sabor': 'flavor enhancers',
    'glucosa': 'glucose',
    'fructosa': 'fructose',
    'lactosa': 'lactose',
    'gluten': 'gluten',
    'soja': 'soy',
    'cacahuete': 'peanut',
    'nueces': 'nuts',
    'almendra': 'almond',
    'avellana': 'hazelnut',
    'nuez': 'walnut',
    'sésamo': 'sesame',
    'mostaza': 'mustard',
    'apio': 'celery',
    'sulfitos': 'sulfites',
  },
  // Chinese to English
  'ZH-EN': {
    '糖': 'sugar',
    '盐': 'salt',
    '油': 'oil',
    '水': 'water',
    '面粉': 'flour',
    '牛奶': 'milk',
    '鸡蛋': 'egg',
    '黄油': 'butter',
    '奶酪': 'cheese',
    '肉': 'meat',
    '鸡肉': 'chicken',
    '鱼': 'fish',
    '番茄': 'tomato',
    '洋葱': 'onion',
    '大蒜': 'garlic',
    '胡椒': 'pepper',
    '柠檬': 'lemon',
    '橙子': 'orange',
    '苹果': 'apple',
    '香蕉': 'banana',
    '米饭': 'rice',
    '豆类': 'beans',
    '土豆': 'potato',
    '胡萝卜': 'carrot',
    '菠菜': 'spinach',
    '生菜': 'lettuce',
    '防腐剂': 'preservatives',
    '色素': 'colorants',
    '香料': 'flavorings',
    '稳定剂': 'stabilizers',
    '乳化剂': 'emulsifiers',
    '增稠剂': 'thickeners',
    '酸味剂': 'acidulants',
    '抗氧化剂': 'antioxidants',
    '甜味剂': 'sweeteners',
    '增味剂': 'flavor enhancers',
    '葡萄糖': 'glucose',
    '果糖': 'fructose',
    '乳糖': 'lactose',
    '麸质': 'gluten',
    '大豆': 'soy',
    '花生': 'peanut',
    '坚果': 'nuts',
    '杏仁': 'almond',
    '榛子': 'hazelnut',
    '核桃': 'walnut',
    '芝麻': 'sesame',
    '芥末': 'mustard',
    '芹菜': 'celery',
    '亚硫酸盐': 'sulfites',
  },
  // Arabic to English
  'AR-EN': {
    'سكر': 'sugar',
    'ملح': 'salt',
    'زيت': 'oil',
    'ماء': 'water',
    'دقيق': 'flour',
    'حليب': 'milk',
    'بيض': 'egg',
    'زبدة': 'butter',
    'جبن': 'cheese',
    'لحم': 'meat',
    'دجاج': 'chicken',
    'سمك': 'fish',
    'طماطم': 'tomato',
    'بصل': 'onion',
    'ثوم': 'garlic',
    'فلفل': 'pepper',
    'ليمون': 'lemon',
    'برتقال': 'orange',
    'تفاح': 'apple',
    'موز': 'banana',
    'أرز': 'rice',
    'فاصوليا': 'beans',
    'بطاطس': 'potato',
    'جزر': 'carrot',
    'سبانخ': 'spinach',
    'خس': 'lettuce',
    'مواد حافظة': 'preservatives',
    'ألوان': 'colorants',
    'نكهات': 'flavorings',
    'مثبتات': 'stabilizers',
    'مستحلبات': 'emulsifiers',
    'مكثفات': 'thickeners',
    'حمضيات': 'acidulants',
    'مضادات أكسدة': 'antioxidants',
    'محليات': 'sweeteners',
    'معززات نكهة': 'flavor enhancers',
    'جلوكوز': 'glucose',
    'فركتوز': 'fructose',
    'لاكتوز': 'lactose',
    'جلوتين': 'gluten',
    'صويا': 'soy',
    'فول سوداني': 'peanut',
    'مكسرات': 'nuts',
    'لوز': 'almond',
    'بندق': 'hazelnut',
    'جوز': 'walnut',
    'سمسم': 'sesame',
    'خردل': 'mustard',
    'كرفس': 'celery',
    'كبريتات': 'sulfites',
  },
};

// Market language mapping
const MARKET_LANGUAGES: Record<string, string> = {
  'US': 'EN',
  'UK': 'EN',
  'ES': 'ES',
  'BR': 'PT',
  'AO': 'PT',
  'MO': 'ZH',
  'AE': 'AR',
};

/**
 * Translate ingredients based on target market
 */
export function translateIngredients(ingredients: string[], targetMarket: string): string[] {
  const targetLanguage = MARKET_LANGUAGES[targetMarket];
  if (!targetLanguage || targetLanguage === 'EN') {
    return ingredients; // No translation needed for English
  }

  const translationKey = `EN-${targetLanguage}`;
  const translations = INGREDIENT_TRANSLATIONS[translationKey];
  
  if (!translations) {
    return ingredients; // No translations available
  }

  return ingredients.map(ingredient => {
    const lowerIngredient = ingredient.toLowerCase().trim();
    return translations[lowerIngredient] || ingredient;
  });
}

/**
 * Translate ingredients from source language to target market language
 */
export function translateIngredientsFromSource(
  ingredients: string[], 
  sourceLanguage: string, 
  targetMarket: string
): string[] {
  const targetLanguage = MARKET_LANGUAGES[targetMarket];
  
  if (sourceLanguage === targetLanguage) {
    return ingredients; // No translation needed
  }

  // First translate to English if source is not English
  let englishIngredients = ingredients;
  if (sourceLanguage !== 'EN') {
    const toEnglishKey = `${sourceLanguage}-EN`;
    const toEnglishTranslations = INGREDIENT_TRANSLATIONS[toEnglishKey];
    
    if (toEnglishTranslations) {
      englishIngredients = ingredients.map(ingredient => {
        const lowerIngredient = ingredient.toLowerCase().trim();
        return toEnglishTranslations[lowerIngredient] || ingredient;
      });
    }
  }

  // Then translate from English to target language
  return translateIngredients(englishIngredients, targetMarket);
}

/**
 * Detect language of ingredients text
 */
export function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for Portuguese indicators
  if (lowerText.includes('açúcar') || lowerText.includes('óleo') || lowerText.includes('água')) {
    return 'PT';
  }
  
  // Check for Spanish indicators
  if (lowerText.includes('azúcar') || lowerText.includes('aceite') || lowerText.includes('agua')) {
    return 'ES';
  }
  
  // Check for Chinese indicators
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'ZH';
  }
  
  // Check for Arabic indicators
  if (/[\u0600-\u06ff]/.test(text)) {
    return 'AR';
  }
  
  // Default to English
  return 'EN';
}

/**
 * Get market-specific ingredient format
 */
export function formatIngredientsForMarket(ingredients: string[], market: string): string {
  const targetLanguage = MARKET_LANGUAGES[market];
  
  switch (targetLanguage) {
    case 'PT':
    case 'ES':
      return ingredients.join(', ');
    case 'ZH':
      return ingredients.join('、');
    case 'AR':
      return ingredients.join('، ');
    default:
      return ingredients.join(', ');
  }
}
