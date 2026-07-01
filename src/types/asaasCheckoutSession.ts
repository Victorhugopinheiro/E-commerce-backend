export interface AsaasCallback {
  successUrl: string;
  cancelUrl: string;
  expiredUrl: string;
}

export interface AsaasItem {
  externalReference: string;
  description: string;
  imageBase64: string;
  name: string;
  quantity: number;
  value: number;
}

export interface AsaasCustomerData {
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  postalCode: string;
  city: string;
}

export type BillingType = 'CREDIT_CARD' | string;
export type ChargeType = 'RECURRENT' | string;
export type Cycle = 'MONTHLY' | string;

export interface AsaasSubscription {
  cycle: Cycle;
  endDate: string;
  nextDueDate: string;
}

export interface AsaasInstallment {
  maxInstallmentCount: number;
}

export interface AsaasSplit {
  walletId: string;
  fixedValue: string;
  percentageValue: number;
  totalFixedValue: number;
}

export interface AsaasCheckoutSession {
  id: string;
  link: string;
  status: string;
  billingTypes: BillingType[];
  chargeTypes: ChargeType[];
  minutesToExpire: number;
  externalReference: string;
  callback: AsaasCallback;
  items: AsaasItem[];
  customerData: AsaasCustomerData;
  subscription?: AsaasSubscription;
  installment?: AsaasInstallment;
  split?: AsaasSplit[];
}

export interface AsaasError {
  code: string;
  description: string;
}

export interface AsaasErrorResponse {
  errors: AsaasError[];
}

export type AsaasCheckoutSessionResponse = AsaasCheckoutSession | AsaasErrorResponse;

export default AsaasCheckoutSessionResponse;
