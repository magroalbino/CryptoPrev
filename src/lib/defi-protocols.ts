// src/lib/defi-protocols.ts

export interface Protocol {
    name: string;
    tvl: number;
    apy: number;
    riskFactor: 'low' | 'medium' | 'high';
}

/**
 * Simulates fetching real-time data from top DeFi protocols.
 * In a real application, this would involve API calls to services like DeFiLlama,
 * or directly querying smart contracts on the blockchain.
 * The APYs are randomized slightly to simulate market fluctuations.
 */
export const getProtocolData = (): Protocol[] => {
    const protocols: Protocol[] = [
        {
            name: "Aave",
            tvl: 9500000000, // $9.5 Billion
            apy: 0.03 + Math.random() * 0.02, // APY between 3% and 5%
            riskFactor: 'low',
        },
        {
            name: "Compound",
            tvl: 6200000000, // $6.2 Billion
            apy: 0.032 + Math.random() * 0.025, // APY between 3.2% and 5.7%
            riskFactor: 'low',
        },
        {
            name: "Curve",
            tvl: 2800000000, // $2.8 Billion
            apy: 0.04 + Math.random() * 0.03, // APY between 4% and 7% for stable pools
            riskFactor: 'medium',
        },
        {
            name: "Convex Finance",
            tvl: 1300000000, // $1.3 Billion
            apy: 0.055 + Math.random() * 0.035, // APY between 5.5% and 9%
            riskFactor: 'medium',
        },
        {
            name: "GMX",
            tvl: 540000000, // $540 Million
            apy: 0.08 + Math.random() * 0.04, // APY between 8% and 12%
            riskFactor: 'high',
        }
    ];

    return protocols;
};
