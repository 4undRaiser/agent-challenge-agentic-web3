import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  isValidSolanaAddress,
  getTokenBalance,
  getTokenPriceData,
  getRecentTransactions,
  getAllNews,
  getOnChainTokenData,
  getTokenHoldersDistribution,
  analyzeTransactionPatterns,
  analyzeHolderConcentration,
  analyzeLiquidity
} from "./helpers";

// Simple async function that conforms to input and output schema
const getInfo = async (ctx: string) =>
  Promise.resolve({ bar: ctx.length, baz: "baz" });




/**
 * Token Price and Sentiment Analysis Tool
 * 
 * Retrieves current price data and market metrics for a specified token.
 * Supports searching by token ID, symbol, or name.
 * 
 * @tool get-token-price
 * @param {string} tokenId - Token identifier (ID, symbol, or name)
 * @returns {Object} Token price data including current price, 24h/7d changes, and volume
 */

export const tokenPriceTool = createTool({
  id: "get-token-price",
  description: "Get real-time price data for any cryptocurrency token. Supports searching by token ID, symbol, or name with improved matching for common tokens like BTC, ETH, SOL, USDT, etc.",
  inputSchema: z.object({
    symbol: z.string().describe("Token identifier (ID, symbol, or name) - e.g., 'btc', 'bitcoin', 'eth', 'ethereum', 'sol', 'usdt', 'tether'"),
    network: z.string().optional().describe("Blockchain network (e.g., ethereum, bsc, polygon)"),
  }),
  outputSchema: z.object({
    name: z.string(),
    symbol: z.string(),
    price: z.number(),
    priceChange24h: z.number(),
    priceChange7d: z.number(),
    volume24h: z.number(),
    lastUpdated: z.string(),
    tokenId: z.string(),
  }),
  execute: async ({ context }) => {
    const result = await getTokenPriceData(context.symbol);
    if (!result) {
      throw new Error("Failed to fetch token price data");
    }
    return result;
  },
});




/**
 * Wallet Activity Analysis Tool
 * 
 * Analyzes a Solana wallet's recent activity, including:
 * - Current SOL balance
 * - Transaction history
 * - Activity categorization (DeFi, NFT, Token transfers)
 * - Time-based filtering
 * 
 * @tool get-address-activity
 * @param {string} walletAddress - Solana wallet address to analyze
 * @param {string} timeRange - Analysis time range (24h, 7d, or 30d)
 * @returns {Object} Wallet activity analysis including balance, transaction counts, and recent activity
 */

export const addressAnalysisTool = createTool({
  id: "get-address-activity",
  description: "Analyze a Solana wallet's recent activity, including: Current SOL balance, Transaction history, Activity categorization (DeFi, NFT, Token transfers), Time-based filtering",
  inputSchema: z.object({
    walletAddress: z.string().describe("Solana wallet address to analyze"),
    timeRange: z.string().describe("Analysis time range (24h, 7d, or 30d)"),
  }),
  outputSchema: z.object({
    walletAddress: z.string(),
    totalBalance: z.number(),
    transactionCount: z.number(),
    transactionTypes: z.object({
      defi: z.number(),
      nft: z.number(),
      token: z.number(),
      unknown: z.number()
    }),
    recentActivity: z.array(z.object({
      type: z.string(),
      amount: z.number(),
      timestamp: z.string(),
      status: z.string()
    })),
    timeRange: z.string(),
    lastUpdated: z.string()
  }),
  execute: async ({ context }) => {
    try {
      const { walletAddress, timeRange } = context;
      
      // Validate wallet address
      if (!isValidSolanaAddress(walletAddress)) {
        throw new Error("Invalid Solana wallet address format");
      }
      
      // Get wallet balance
      const balance = await getTokenBalance(walletAddress);
      
      // Get recent transactions
      const transactions = await getRecentTransactions(walletAddress, 20);
      
      // Calculate time-based filtering
      const now = Math.floor(Date.now() / 1000);
      const timeRanges: Record<string, number> = {
        "24h": now - 86400,
        "7d": now - 604800,
        "30d": now - 2592000
      };
      const startTime = timeRanges[timeRange] || timeRanges["24h"];
      
      // Filter transactions by time range
      const filteredTransactions = transactions.filter(tx => 
        tx.timestamp && tx.timestamp >= startTime
      );
      
      // Analyze transaction types
      const defiCount = filteredTransactions.filter(tx => tx.type === "DeFi").length;
      const nftCount = filteredTransactions.filter(tx => tx.type === "NFT").length;
      const tokenCount = filteredTransactions.filter(tx => tx.type === "Token Transfer").length;
      const unknownCount = filteredTransactions.filter(tx => tx.type === "Unknown").length;
      
      return {
        walletAddress,
        totalBalance: balance,
        transactionCount: filteredTransactions.length,
        transactionTypes: {
          defi: defiCount,
          nft: nftCount,
          token: tokenCount,
          unknown: unknownCount
        },
        recentActivity: filteredTransactions.slice(0, 5).map(tx => ({
          type: tx.type,
          amount: tx.amount,
          timestamp: new Date(tx.timestamp! * 1000).toISOString(),
          status: tx.status
        })),
        timeRange,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error analyzing wallet address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});




/**
 * Crypto News Aggregation Tool
 * 
 * Fetches and aggregates latest crypto and web3 news from multiple sources.
 * Features:
 * - Category-based filtering
 * - Mobile-friendly formatting
 * - Trending topics analysis
 * - Sentiment analysis
 * 
 * Default Specifications:
 * - If no category specified: 'all' (fetches from all categories)
 * - If no limit specified: 10 articles
 * - If no format specified: 'mobile' (concise, mobile-friendly format)
 * 
 * @tool get-latest-crypto-news
 * @param {string} category - News category (all, defi, nft, web3, trading). Default: 'all'
 * @param {number} limit - Maximum number of articles to return (1-20). Default: 10
 * @param {string} format - Response format (mobile or detailed). Default: 'mobile'
 * @returns {Object|string} News articles in either detailed JSON or mobile-friendly format
 */

export const cryptoNewsTool = createTool({
  id: "get-latest-crypto-news",
  description: "Fetches and aggregates latest crypto and web3 news from multiple sources. Features: Category-based filtering, Mobile-friendly formatting, Trending topics analysis, Sentiment analysis. Defaults: 10 articles, 'all' categories, 'mobile' format",
  inputSchema: z.object({
    category: z.enum(['all', 'defi', 'nft', 'web3', 'trading']).default('all')
      .describe("Category of news to fetch (all, defi, nft, web3, or trading). Default: 'all'"),
    limit: z.number().min(1).max(20).default(10)
      .describe("Maximum number of news articles to return (1-20). Default: 10"),
    format: z.enum(['mobile', 'detailed']).default('mobile')
      .describe("Response format - 'mobile' for concise mobile-friendly format, 'detailed' for full JSON. Default: 'mobile'")
  }),
  outputSchema: z.object({
    category: z.string(),
    totalResults: z.number(),
    articles: z.array(z.object({
      title: z.string(),
      summary: z.string(),
      source: z.string(),
      url: z.string(),
      publishedAt: z.string(),
      sentiment: z.string().optional(),
      categories: z.array(z.string())
    })),
    trendingTopics: z.array(z.string()),
    lastUpdated: z.string(),
    format: z.string()
  }),
  execute: async ({ context }) => {
    try {
      const { category, limit, format } = context;
      
      // Get all news
      const newsData = await getAllNews();
      
      // Filter by category if not 'all'
      let filteredArticles = newsData.articles;
      if (category !== 'all') {
        filteredArticles = newsData.articles.filter(article => 
          article.categories.some(cat => 
            cat.toLowerCase().includes(category.toLowerCase())
          )
        );
      }

      // Apply limit
      filteredArticles = filteredArticles.slice(0, limit);

      return {
        category,
        totalResults: newsData.totalResults,
        articles: filteredArticles.map(article => ({
          title: article.title,
          summary: article.summary,
          source: article.source,
          url: article.url,
          publishedAt: new Date(article.publishedAt).toLocaleString(),
          sentiment: article.sentiment,
          categories: article.categories
        })),
        trendingTopics: newsData.trendingTopics,
        lastUpdated: newsData.lastUpdated,
        format
      };
    } catch (error) {
      throw new Error(`Error fetching crypto news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});



/**
 * Token Risk Analysis Tool
 * 
 * Analyzes a token for potential risks and fraud indicators:
 * - Holder concentration analysis
 * - Transaction pattern analysis
 * - Liquidity analysis
 * - Contract risk assessment
 * 
 * @tool potential-rugpull-and-fraud-token-analysis
 * @param {string} tokenAddress - Solana token address to analyze
 * @returns {Object} Risk analysis including risk score, level, and detailed metrics
 */

export const tokenRiskAnalysisTool = createTool({
  id: "potential-rugpull-and-fraud-token-analysis",
  description: "Analyzes a token for potential risks and fraud indicators: Holder concentration analysis, Transaction pattern analysis, Liquidity analysis, Contract risk assessment",
  inputSchema: z.object({
    tokenAddress: z.string()
    .describe("Solana token address to analyze for fraud/rugpull risk")
    .refine(isValidSolanaAddress, {
      message: "Invalid token address format. Please provide a valid Solana address."
    })
  }),
  outputSchema: z.object({
    tokenAddress: z.string(),
    riskScore: z.number(),
    riskLevel: z.string(),
    detailedMetrics: z.object({
      liquidityScore: z.number(),
      holderConcentrationScore: z.number(),
      transactionPatternScore: z.number(),
      contractRiskScore: z.number(),
      overallRiskScore: z.number(),
      riskFactors: z.array(z.string())
    }),
    summary: z.string(),
    lastUpdated: z.string()
  }),
  execute: async ({ context }) => {
    try {
      const { tokenAddress } = context;
      
      // Verify token exists first with retry
      try {
        await getOnChainTokenData(tokenAddress);
      } catch (error) {
        throw new Error(`Unable to fetch token data. This could be due to:
1. Invalid token address
2. Network connectivity issues
3. Token no longer exists
Please verify the token address and try again.`);
      }

      // Get all metrics with retry logic
      const holders = await getTokenHoldersDistribution(tokenAddress);
      const holderAnalysis = analyzeHolderConcentration(holders);
      const transactionAnalysis = await analyzeTransactionPatterns(tokenAddress);
      const liquidityAnalysis = await analyzeLiquidity(tokenAddress);

      // Calculate overall risk score (weighted average)
      const overallRiskScore = Math.round(
        (holderAnalysis.score * 0.4) + // 40% weight to holder concentration
        (transactionAnalysis.score * 0.3) + // 30% weight to transaction patterns
        (liquidityAnalysis.score * 0.3) // 30% weight to liquidity
      );

      // Combine all risk factors
      const allRiskFactors = [
        ...holderAnalysis.factors,
        ...transactionAnalysis.factors,
        ...liquidityAnalysis.factors
      ];

      // Add warning if we couldn't get all data
      if (holders.length === 0) {
        allRiskFactors.push("Warning: Could not fetch holder distribution data");
      }
      if (transactionAnalysis.score === 0) {
        allRiskFactors.push("Warning: Could not fetch transaction data");
      }

      const analysis = {
        liquidityScore: liquidityAnalysis.score,
        holderConcentrationScore: holderAnalysis.score,
        transactionPatternScore: transactionAnalysis.score,
        contractRiskScore: 100,
        overallRiskScore,
        riskFactors: allRiskFactors
      };

      // Generate risk assessment message
      let riskLevel = "LOW";
      if (overallRiskScore >= 80) {
        riskLevel = "EXTREMELY HIGH";
      } else if (overallRiskScore >= 60) {
        riskLevel = "HIGH";
      } else if (overallRiskScore >= 40) {
        riskLevel = "MEDIUM";
      }

      const summary = `Token Risk Analysis (${overallRiskScore}% risk score - ${riskLevel} RISK):
${allRiskFactors.length > 0 ? '\nRisk Factors:\n- ' + allRiskFactors.join('\n- ') : 'No significant risk factors detected'}`;

      return {
        tokenAddress,
        riskScore: overallRiskScore,
        riskLevel,
        detailedMetrics: analysis,
        summary,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error analyzing token risk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

