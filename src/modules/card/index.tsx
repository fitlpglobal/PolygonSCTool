import React, { useState } from 'react';
import CardForm from './components/CardForm';
import CardPreview from './components/CardPreview';
import type { CardFormData } from './types';
import { readFileAsDataUrl } from './utils';

const CardModule: React.FC = () => {
  const [formData, setFormData] = useState<CardFormData>({
    collectionName: '',
    batchNumber: '',
    issuerBusinessName: '',
    batchDescription: '',
    noOfCards: 1,
    cardName: '',
    prefixId: '',
    issueDate: '',
    expireDate: '',
    price: 0,
    currencyType: 'USD',
    cardGraphic: null,
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cardGraphic: file }));
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setImagePreview(dataUrl);
      } catch (err) {
        console.error('Failed to read file', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Collection data logged to console!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--english-violet)' }}>Loyalty Card Creator</h1>
        <p className="text-lg" style={{ color: 'var(--french-violet)' }}>Design and deploy your loyalty card collection</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <CardForm
          formData={formData}
          onInputChange={handleInputChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
        />

        <CardPreview formData={formData} imagePreview={imagePreview} />
      </div>
    </div>
  );
};

export default CardModule;
