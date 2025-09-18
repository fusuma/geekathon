export const MARKET_CONFIG = {
  US: {
    label: 'United States',
    language: 'EN',
    requirements: ['FDA Food Labeling Requirements', 'USDA Standards'],
    regulations: ['English language required', 'Nutritional values per serving', 'Allergen declaration required'],
  },
  UK: {
    label: 'United Kingdom',
    language: 'EN',
    requirements: ['UK Food Information Regulations 2014', 'FSA Guidelines'],
    regulations: ['English language required', 'Allergens must be highlighted', 'Nutritional values per 100g/ml'],
  },
  ES: {
    label: 'Spain',
    language: 'ES',
    requirements: ['EU Food Information Regulation (FIC)', 'Spanish Royal Decree 1245/2008'],
    regulations: ['Spanish language required', 'Allergens must be highlighted', 'Nutritional values per 100g/ml'],
  },
  BR: {
    label: 'Brazil',
    language: 'PT',
    requirements: ['ANVISA RDC 360/2003', 'ANVISA RDC 429/2020'],
    regulations: ['Front-of-pack labeling for high sugar, fat, sodium', 'Nutritional values per portion'],
  },
  AO: {
    label: 'Angola',
    language: 'PT',
    requirements: ['Angolan Food Safety Law', 'CODEX Alimentarius'],
    regulations: ['Portuguese language required', 'Basic nutritional information'],
  },
  MO: {
    label: 'Macau',
    language: 'ZH',
    requirements: ['Macau Food Safety Law', 'GB Standards (China)'],
    regulations: ['Chinese and Portuguese language required', 'Nutritional values per 100g/ml'],
  },
  AE: {
    label: 'UAE (Halal)',
    language: 'AR',
    requirements: ['UAE.S GSO 2055-1 (Halal)', 'UAE.S 9:2013 (Labeling)'],
    regulations: ['Halal certification required', 'Arabic language required', 'Nutritional values per 100g/ml'],
  },
};
