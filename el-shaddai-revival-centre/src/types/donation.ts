export interface Donation {
  id?: string;
  amount: number;
  currency: string;
  frequency: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  donorName: string;
  donorEmail: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  receiptSent: boolean;
}

export interface DonationFormData {
  amount: string;
  customAmount: string;
  frequency: 'one-time' | 'monthly' | 'weekly';
  firstName: string;
  lastName: string;
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}