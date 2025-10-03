import React from 'react';
import { Upload, Hash, Building, Package, Calendar, DollarSign, FileText } from 'lucide-react';
import type { CardFormData } from '../types';
import { currencies } from '../data';

interface Props {
  formData: CardFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CardForm: React.FC<Props> = ({ formData, onInputChange, onFileChange, onSubmit }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-black">
        <FileText className="mr-2" style={{ color: 'var(--primary-violet)' }} />
        Card Details
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Collection Name</label>
            <input
              type="text"
              name="collectionName"
              value={formData.collectionName}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-black rounded-lg transition-all focus:ring-2 focus:ring-violet-200"
              style={{ 
                borderColor: 'black'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-violet)';
                e.target.style.boxShadow = '0 0 0 2px rgba(122, 40, 203, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'black';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter collection name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Batch Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-5 w-5" style={{ color: 'var(--primary-violet)' }} />
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-2 border border-black rounded-lg transition-all"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-violet)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(122, 40, 203, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'black';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="e.g., BATCH001"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Issuer Business Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="issuerBusinessName"
              value={formData.issuerBusinessName}
              onChange={onInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Your business name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Description</label>
          <textarea
            name="batchDescription"
            value={formData.batchDescription}
            onChange={onInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe this loyalty card collection..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cards</label>
            <div className="relative">
              <Package className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="noOfCards"
                value={formData.noOfCards}
                onChange={onInputChange}
                min="1"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Name</label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., VIP Member Card"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prefix ID</label>
          <input
            type="text"
            name="prefixId"
            value={formData.prefixId}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., VIP, GOLD, SILVER"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expire Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="expireDate"
                value={formData.expireDate}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              name="currencyType"
              value={formData.currencyType}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Graphic</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input type="file" name="cardGraphic" onChange={onFileChange} accept="image/*" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full text-white py-3 px-6 rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
          style={{ background: 'var(--primary-violet)' }}
        >
          Deploy Collection
        </button>
      </form>
    </div>
  );
};

export default CardForm;
