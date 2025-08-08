// src/lib/apy.ts

/**
 * Total Value Locked (TVL) on the platform.
 * In a real application, this would be fetched from a reliable source (e.g., smart contracts).
 */
export const MOCK_TVL = 12543210.54;

// Base APY rates for different lock-up periods (in months)
const BASE_APY_RATES: { [key: number]: number } = {
  3: 0.04,  // 4.0%
  6: 0.05,  // 5.0%
  12: 0.065, // 6.5%
  36: 0.08, // 8.0%
  60: 0.095  // 9.5%
};

/**
 * Calculates a bonus APY based on the TVL.
 * This simulates a scenario where higher TVL allows access to better yield opportunities.
 * @param tvl - The Total Value Locked on the platform.
 * @returns The APY bonus as a decimal.
 */
const getTvlApyBonus = (tvl: number): number => {
  if (tvl >= 50000000) { // Over $50M
    return 0.015; // +1.5%
  }
  if (tvl >= 10000000) { // Over $10M
    return 0.010; // +1.0%
  }
  if (tvl >= 1000000) {  // Over $1M
    return 0.005; // +0.5%
  }
  return 0; // No bonus
};

/**
 * Calculates the final APY for a given lock-up period, including the TVL bonus.
 * @param lockupPeriod - The lock-up period in months.
 * @param tvl - The Total Value Locked on the platform.
 * @returns The final APY as a decimal (e.g., 0.085 for 8.5%).
 */
export const getDynamicApy = (lockupPeriod: number, tvl: number = MOCK_TVL): number => {
  const baseApy = BASE_APY_RATES[lockupPeriod] || 0;
  const bonusApy = getTvlApyBonus(tvl);
  return baseApy + bonusApy;
};
