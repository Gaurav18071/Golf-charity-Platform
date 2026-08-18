/**
 * Payment Gateway Factory
 * 
 * Factory for resolving active payment gateway providers.
 * 
 * @module features/donation/gateway
 */

import { PaymentGateway } from "@prisma/client";
import type { IPaymentGateway } from "./payment-gateway.interface";
import { RazorpayGateway } from "./razorpay.gateway";

const instances: Partial<Record<PaymentGateway, IPaymentGateway>> = {};

export function getPaymentGateway(
  gatewayType: PaymentGateway = PaymentGateway.RAZORPAY
): IPaymentGateway {
  if (!instances[gatewayType]) {
    switch (gatewayType) {
      case PaymentGateway.RAZORPAY:
      default:
        instances[gatewayType] = new RazorpayGateway();
        break;
    }
  }

  return instances[gatewayType]!;
}
