import React from 'react';

interface MarketSelectorProps {
  market: string;
  setMarket: (market: string) => void;
  certifications: string[];
  setCertifications: (certifications: string[]) => void;
}

export default function MarketSelector({ 
  market, 
  setMarket, 
  certifications, 
  setCertifications 
}: MarketSelectorProps) {
  const markets = [
    { value: 'spain', label: 'Spain (EU)' },
    { value: 'angola', label: 'Angola' },
    { value: 'macau', label: 'Macau' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'halal', label: 'Middle East (Halal)' }
  ];

  const availableCertifications = [
    { value: 'halal', label: 'Halal Certified' },
    { value: 'ifs', label: 'IFS Food Standard' },
    { value: 'organic', label: 'Organic' },
    { value: 'non-gmo', label: 'Non-GMO' }
  ];

  const handleCertificationChange = (certValue: string) => {
    setCertifications(
      certifications.includes(certValue) 
        ? certifications.filter(c => c !== certValue)
        : [...certifications, certValue]
    );
  };

  return (
    <div className="market-selector">
      <div className="form-group">
        <label htmlFor="market">Target Market:</label>
        <select 
          id="market"
          value={market} 
          onChange={(e) => setMarket(e.target.value)}
        >
          {markets.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Certifications:</label>
        <div className="certification-checkboxes">
          {availableCertifications.map(cert => (
            <label key={cert.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={certifications.includes(cert.value)}
                onChange={() => handleCertificationChange(cert.value)}
              />
              {cert.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
