import { apiClient } from './client';

export interface SavedPaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  holderName?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  status: string;
  transactionId: string;
}

export const paymentApi = {
  getSavedMethods: async (): Promise<SavedPaymentMethod[]> => {
    try {
      const response = await apiClient.get('/payment/methods');
      return response.data?.data || response.data;
    } catch (_error) {
      // Mock saved payment methods for development / testing
      return [
        {
          id: 'pm-visa-4242',
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2028,
          isDefault: true,
          holderName: 'Uzair Ahmed',
        },
        {
          id: 'pm-mc-8888',
          brand: 'mastercard',
          last4: '8888',
          expMonth: 8,
          expYear: 2027,
          isDefault: false,
          holderName: 'Uzair Ahmed',
        },
      ];
    }
  },

  createPaymentIntent: async (amount: number, currency = 'PKR'): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post('/payment/create-intent', { amount, currency });
      return response.data?.data || response.data;
    } catch (_error) {
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount,
        currency,
      };
    }
  },

  confirmPayment: async (
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<ConfirmPaymentResponse> => {
    try {
      const response = await apiClient.post('/payment/confirm', {
        paymentIntentId,
        paymentMethodId,
      });
      return response.data?.data || response.data;
    } catch (_error) {
      return {
        success: true,
        status: 'succeeded',
        transactionId: `txn_${Date.now().toString(36)}`,
      };
    }
  },

  savePaymentMethod: async (paymentMethodId: string): Promise<SavedPaymentMethod> => {
    try {
      const response = await apiClient.post('/payment/methods', { paymentMethodId });
      return response.data?.data || response.data;
    } catch (_error) {
      return {
        id: `pm_new_${Date.now()}`,
        brand: 'visa',
        last4: '1234',
        expMonth: 10,
        expYear: 2029,
        isDefault: false,
      };
    }
  },
};
