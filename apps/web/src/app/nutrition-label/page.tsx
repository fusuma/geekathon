'use client';

import React from 'react';
import LabelGenerator from '../../components/nutrition-label/LabelGenerator';
import '../../styles/nutrition-label.css';

export default function NutritionLabelPage() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>SmartLabel AI - Nutrition Label Generator</h1>
        <p>Generate compliant nutrition labels for global markets</p>
      </header>
      <main>
        <LabelGenerator />
      </main>
    </div>
  );
}
