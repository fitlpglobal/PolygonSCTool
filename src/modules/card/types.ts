export interface CardFormData {
  collectionName: string;
  batchNumber: string;
  issuerBusinessName: string;
  batchDescription: string;
  noOfCards: number;
  cardName: string;
  prefixId: string;
  issueDate: string;
  expireDate: string;
  price: number;
  currencyType: string;
  cardGraphic: File | null;
}

export interface CurrencyOption {
  code: string;
  name: string;
}
