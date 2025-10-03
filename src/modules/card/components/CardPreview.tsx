import React from 'react';
import { CreditCard } from 'lucide-react';
import type { CardFormData } from '../types';
import { formatDate } from '../utils';

interface Props {
  formData: CardFormData;
  imagePreview: string;
}

export const CardPreview: React.FC<Props> = ({ formData, imagePreview }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-black">
        <CreditCard className="mr-2" style={{ color: 'var(--primary-violet)' }} />
        Card Preview
      </h2>

      <div className="rounded-xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform duration-300" style={{ background: 'var(--primary-violet)' }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{formData.cardName || 'Card Name'}</h3>
            <p className="text-gray-100">{formData.issuerBusinessName || 'Business Name'}</p>
          </div>
          {imagePreview && (
            <div className="w-16 h-16 bg-white rounded-lg p-1">
              <img src={imagePreview} alt="Card graphic" className="w-full h-full object-cover rounded" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-200">Card ID:</span>
            <span>{formData.prefixId ? `${formData.prefixId}-0001` : 'PREFIX-0001'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-200">Price:</span>
            <span>
              {formData.currencyType} {Number.isFinite(formData.price) ? formData.price.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-200">Valid From:</span>
            <span>{formatDate(formData.issueDate) || 'Select date'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-200">Expires:</span>
            <span>{formatDate(formData.expireDate) || 'Select date'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-400">
          <p className="text-xs text-purple-100">{formData.batchDescription || 'Card description will appear here...'}</p>
        </div>
      </div>

      {formData.collectionName && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Collection Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Collection:</strong> {formData.collectionName}
            </p>
            <p>
              <strong>Batch:</strong> {formData.batchNumber}
            </p>
            <p>
              <strong>Quantity:</strong> {formData.noOfCards} cards
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPreview;
