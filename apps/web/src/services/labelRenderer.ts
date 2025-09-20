import { NutritionLabelData } from './bedrockService';

export function createNutritionLabelCanvas(labelData: NutritionLabelData, market = 'spain'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Set canvas size
  canvas.width = 400;
  canvas.height = 600;
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Black border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  let y = 40;
  
  // Title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Nutrition Facts', canvas.width / 2, y);
  y += 30;
  
  // Market-specific subtitle
  if (market === 'spain') {
    ctx.font = '12px Arial';
    ctx.fillText('Información Nutricional', canvas.width / 2, y);
    y += 20;
  } else if (market === 'brazil') {
    ctx.font = '12px Arial';
    ctx.fillText('Informação Nutricional', canvas.width / 2, y);
    y += 20;
  }
  
  // Serving information
  ctx.textAlign = 'left';
  ctx.font = '12px Arial';
  ctx.fillText(`${labelData.nutrition_facts.servings_per_container} servings per container`, 20, y);
  y += 20;
  
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Serving size', 20, y);
  ctx.textAlign = 'right';
  ctx.fillText(labelData.nutrition_facts.serving_size, canvas.width - 20, y);
  y += 25;
  
  // Thick line
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(canvas.width - 20, y);
  ctx.lineWidth = 8;
  ctx.stroke();
  y += 15;
  
  // Calories
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Calories', 20, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(labelData.nutrition_facts.calories, canvas.width - 20, y);
  y += 30;
  
  // Medium line
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(canvas.width - 20, y);
  ctx.lineWidth = 4;
  ctx.stroke();
  y += 15;
  
  // % Daily Value header
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('% Daily Value*', canvas.width - 20, y);
  y += 20;
  
  // Nutrients
  labelData.nutrition_facts.nutrients.forEach(nutrient => {
    ctx.textAlign = 'left';
    const x = nutrient.indented ? 40 : 20;
    const fontWeight = nutrient.major ? 'bold' : 'normal';
    ctx.font = `${fontWeight} 12px Arial`;
    
    const text = `${nutrient.name} ${nutrient.amount}${nutrient.unit}`;
    ctx.fillText(text, x, y);
    
    if (nutrient.daily_value) {
      ctx.textAlign = 'right';
      ctx.font = `${fontWeight} 12px Arial`;
      ctx.fillText(`${nutrient.daily_value}%`, canvas.width - 20, y);
    }
    
    y += 18;
  });
  
  y += 10;
  
  // Vitamins and minerals
  if (labelData.nutrition_facts.vitamins_minerals?.length > 0) {
    labelData.nutrition_facts.vitamins_minerals.forEach(vitamin => {
      ctx.textAlign = 'left';
      ctx.font = '10px Arial';
      ctx.fillText(`${vitamin.name} ${vitamin.amount}${vitamin.unit} ${vitamin.daily_value}%`, 20, y);
      y += 15;
    });
    y += 10;
  }
  
  // Ingredients
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Ingredients: ', 20, y);
  y += 15;
  
  ctx.font = '10px Arial';
  const ingredients = labelData.ingredients;
  const words = ingredients.split(' ');
  let line = '';
  
  words.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > canvas.width - 40 && line !== '') {
      ctx.fillText(line, 20, y);
      line = word + ' ';
      y += 12;
    } else {
      line = testLine;
    }
  });
  
  if (line) {
    ctx.fillText(line, 20, y);
    y += 15;
  }
  
  // Allergens
  if (labelData.allergens) {
    y += 10;
    ctx.font = 'bold 10px Arial';
    const allergenText = market === 'brazil' ? `ALÉRGENOS: ${labelData.allergens}` : `Contains: ${labelData.allergens}`;
    ctx.fillText(allergenText, 20, y);
    y += 15;
  }
  
  // Certifications
  if (labelData.certifications?.length > 0) {
    y += 10;
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`Certifications: ${labelData.certifications.join(', ')}`, 20, y);
    y += 15;
  }
  
  // Daily value note
  y += 10;
  ctx.font = '8px Arial';
  const note = labelData.daily_value_note || "* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.";
  const noteWords = note.split(' ');
  let noteLine = '';
  
  noteWords.forEach(word => {
    const testLine = noteLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > canvas.width - 40 && noteLine !== '') {
      ctx.fillText(noteLine, 20, y);
      noteLine = word + ' ';
      y += 10;
    } else {
      noteLine = testLine;
    }
  });
  
  if (noteLine) {
    ctx.fillText(noteLine, 20, y);
  }
  
  return canvas;
}

export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
