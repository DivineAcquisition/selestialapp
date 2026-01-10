/**
 * Unified Pricing Adapter
 * Routes pricing calculations through the configured pricing engine
 */

import { PRICING_MODE } from './pricing-mode';
import { calculateFixedPricing } from './fixed-pricing-system';
import { calculatePricing, StateCode, ServiceType, FrequencyType } from './state-pricing-system';
import { calculateNewPricing, HOME_SIZE_RANGES, getHomeSizeBySquareFootage } from './new-pricing-system';

// ═══════════════════════════════════════════════════════════
// UNIFIED INTERFACE
// ═══════════════════════════════════════════════════════════

export interface PriceQuoteParams {
  stateCode: string;
  sqft?: number;
  homeSizeId?: string;
  serviceTypeId: string;
  frequencyId: string;
}

export interface PriceQuote {
  discountedPrice: number;
  depositAmount: number;
  basePrice: number;
  discountAmount: number;
  savings: string;
  recurringDetails?: {
    perClean: number;
    cleansPerMonth: number;
    monthlyTotal: number;
  };
  tierLabel: string;
  bedroomRange: string;
  requiresEstimate: boolean;
}

// ═══════════════════════════════════════════════════════════
// ROUTER FUNCTION
// ═══════════════════════════════════════════════════════════

export function getPriceQuote(params: PriceQuoteParams): PriceQuote | null {
  const { stateCode, sqft, homeSizeId, serviceTypeId, frequencyId } = params;

  // Determine home size ID from sqft if not provided
  let resolvedHomeSizeId = homeSizeId;
  if (!resolvedHomeSizeId && sqft) {
    const homeSize = getHomeSizeBySquareFootage(sqft);
    resolvedHomeSizeId = homeSize?.id;
  }

  try {
    switch (PRICING_MODE) {
      
      // ─────────────────────────────────────────────
      // FIXED MODE: Flat pricing, no sqft variation
      // ─────────────────────────────────────────────
      case 'fixed': {
        const result = calculateFixedPricing(serviceTypeId, frequencyId);
        const homeSize = resolvedHomeSizeId 
          ? HOME_SIZE_RANGES.find(r => r.id === resolvedHomeSizeId)
          : null;
        
        return {
          discountedPrice: result.finalPrice,
          depositAmount: Math.round(result.finalPrice * 0.25 * 100) / 100,
          basePrice: result.basePrice || result.finalPrice,
          discountAmount: (result.basePrice || result.finalPrice) - result.finalPrice,
          savings: result.isRecurring ? 'Recurring discount applied' : '',
          recurringDetails: result.isRecurring && result.perCleanPrice
            ? {
                perClean: result.perCleanPrice,
                cleansPerMonth: result.cleansPerMonth!,
                monthlyTotal: result.monthlyTotal
              }
            : undefined,
          tierLabel: homeSize?.label || 'Standard Home',
          bedroomRange: homeSize?.bedroomRange || '',
          requiresEstimate: false
        };
      }

      // ─────────────────────────────────────────────
      // STATE MODE: State-based tiered pricing
      // ─────────────────────────────────────────────
      case 'state': {
        const result = calculatePricing(
          stateCode as StateCode,
          sqft || 2000,
          serviceTypeId as ServiceType,
          frequencyId as FrequencyType
        );
        if (!result) return null;

        const homeSize = resolvedHomeSizeId 
          ? HOME_SIZE_RANGES.find(r => r.id === resolvedHomeSizeId)
          : null;

        return {
          discountedPrice: result.discountedPrice,
          depositAmount: Math.round(result.discountedPrice * 0.25 * 100) / 100,
          basePrice: result.originalPrice,
          discountAmount: result.savings,
          savings: result.recurringDetails 
            ? `${result.recurringDetails.cleansPerMonth}x per month` 
            : '',
          recurringDetails: result.recurringDetails,
          tierLabel: result.tier.label,
          bedroomRange: homeSize?.bedroomRange || '',
          requiresEstimate: result.tier.id === '5000_plus'
        };
      }

      // ─────────────────────────────────────────────
      // NEW MODE: Full dynamic with multipliers
      // ─────────────────────────────────────────────
      case 'new': {
        if (!resolvedHomeSizeId) {
          return null;
        }

        const result = calculateNewPricing(
          resolvedHomeSizeId, 
          serviceTypeId, 
          frequencyId, 
          stateCode
        );

        return {
          discountedPrice: result.finalPrice,
          depositAmount: result.depositAmount,
          basePrice: result.basePrice,
          discountAmount: result.discountAmount,
          savings: result.savings,
          recurringDetails: result.recurringDetails,
          tierLabel: result.tierLabel,
          bedroomRange: result.bedroomRange,
          requiresEstimate: result.requiresEstimate
        };
      }

      default:
        console.error(`Unknown pricing mode: ${PRICING_MODE}`);
        return null;
    }
  } catch (error) {
    console.error('Error calculating price quote:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// RE-EXPORTS FOR CONVENIENCE
// ═══════════════════════════════════════════════════════════

export { PRICING_MODE } from './pricing-mode';
export { HOME_SIZE_RANGES, DEFAULT_PRICING_CONFIG, getHomeSizeBySquareFootage } from './new-pricing-system';
export type { HomeSizeRange, ServiceTypeConfig, FrequencyConfig } from './new-pricing-system';
