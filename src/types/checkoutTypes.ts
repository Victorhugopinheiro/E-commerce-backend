export interface AsaasCheckoutCallback {
  successUrl: string;
  cancelUrl: string;
  expiredUrl: string;
}

export interface AsaasCheckoutItem {
  externalReference: string;
  description: string;
  imageBase64?: string;
  name: string;
  quantity: number;
  value: number;
}

export interface AsaasCheckoutCustomerData {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  postalCode: string;
  city: string | number;
}

export interface AsaasCheckoutSubscription {
  cycle: string;
  endDate?: string;
  nextDueDate?: string;
}

export interface AsaasCheckoutInstallment {
  maxInstallmentCount: number;
}

export interface AsaasCheckoutSplit {
  walletId: string;
  fixedValue?: string;
  percentageValue?: number;
  totalFixedValue?: number;
}

export interface AsaasErrorDetail {
  code?: string;
  description?: string;
  message?: string;
}

export interface AsaasErrorResponse {
  errors: AsaasErrorDetail[];
}

export interface AsaasCheckoutSession {
  id: string;
  link: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  billingTypes: string[];
  chargeTypes: string[];
  minutesToExpire: number;
  externalReference: string;
  callback: AsaasCheckoutCallback;
  items: AsaasCheckoutItem[];
  customerData: AsaasCheckoutCustomerData;
  subscription?: AsaasCheckoutSubscription;
  installment?: AsaasCheckoutInstallment;
  split?: AsaasCheckoutSplit[];
}

export type AsaasCheckoutSessionResponse = AsaasCheckoutSession | AsaasErrorResponse;

export interface CreateAsaasCheckoutSessionRequest {
  billingTypes: string[];
  chargeTypes: string[];
  minutesToExpire: number;
  externalReference: string;
  callback: AsaasCheckoutCallback;
  items: AsaasCheckoutItem[];
  customerData: AsaasCheckoutCustomerData;
  subscription?: AsaasCheckoutSubscription;
  installment?: AsaasCheckoutInstallment;
  split?: AsaasCheckoutSplit[];
}