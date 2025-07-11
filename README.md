# Agentic web3 - Comprehensive Blockchain & Cryptocurrency Assistant

![Agentic web3](./assets/NosanaBuildersChallengeAgents.jpg)

## Overview

Agentic web3 is an AI-powered onchain assistant that provides real-time insights into the blockchain ecosystem, it offers advanced tools for cryptocurrency analysis, wallet monitoring, crypto news aggregation, and fraud detection.

## Features

### 🔍 **Token Price Analysis**

- Real-time price data for any cryptocurrency
- Market cap, volume, and price change tracking (24h/7d)
- Support for 20,000+ tokens via CoinGecko API
- Smart token matching (BTC, ETH, SOL, USDT, etc.)

### 💼 **Wallet Activity Analysis**

- Solana wallet transaction history and balance tracking
- Activity categorization (DeFi, NFT, Token transfers)
- Time-based filtering (24h, 7d, 30d)
- Transaction pattern analysis

### 📰 **Crypto News Aggregation**

- Latest cryptocurrency and Web3 news from multiple sources
- Category filtering (all, DeFi, NFT, Web3, trading)
- Trending topics analysis
- Mobile-friendly and detailed formats
- **Default: 10 articles from all categories**

### 🛡️ **Fraud Detection & Risk Analysis**

- Token risk assessment for potential rug pulls
- Holder concentration analysis
- Liquidity and transaction pattern evaluation
- Contract security analysis
- Overall risk scoring (0-100)

## How It Works

### Tool Breakdown

#### 1. Token Price Tool (`get-token-price`)

```typescript
// Searches by token ID, symbol, or name
// Returns: price, 24h/7d changes, volume, market data
```

#### 2. Address Analysis Tool (`get-address-activity`)

```typescript
// Analyzes Solana wallet activity
// Returns: balance, transaction types, recent activity
```

#### 3. Crypto News Tool (`get-latest-crypto-news`)

```typescript
// Aggregates news from multiple sources
// Defaults: 10 articles, all categories, mobile format
// Returns: articles, trending topics, sentiment analysis
```

#### 4. Risk Analysis Tool (`token-risk-analysis`)

```typescript
// Evaluates token security and risk factors
// Returns: risk score, factors, recommendations
```

## Quick Start

### Prerequisites

- Node.js >= 20.9.0
- pnpm (recommended) or npm
- Solana wallet (for testing wallet features)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd agent-challenge-agentic-web3
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp env.example .env
```

Edit `.env` with your API keys:

```env
# Required: OpenAI API Key for AI model access
OPENAI_API_KEY=your-openai-api-key-here

# Optional: CryptoCompare API Key for enhanced crypto data
CRYPTOCOMPARE_API_KEY=your-cryptocompare-api-key-here

# Optional: News API Key for crypto news
NEWS_API_KEY=your-news-api-key-here

# Model configuration
MODEL_NAME_AT_ENDPOINT=gpt-4o-mini
```

4. **Start development server**

```bash
pnpm run dev
```

5. **Access the agent**
   Navigate to `http://localhost:8080` in your browser

## Usage Examples

### Get Token Price

```
User: "What's the current price of Bitcoin?"
Agent: [Fetches real-time BTC price, 24h change, volume]
```

### Analyze Wallet

```
User: "Analyze wallet 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
Agent: [Shows balance, transaction history, activity patterns]
```

### Get Crypto News

```
User: "Show me the latest crypto news"
Agent: [Returns 10 latest articles from all categories by default]
```

### Risk Analysis

```
User: "Analyze this token for risks: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
Agent: [Provides risk score, security factors, recommendations]
```

## Development

### Project Structure

```
src/mastra/agents/agentic_web3/
├── agent_tools.ts      # Tool definitions and schemas
├── helpers.ts          # Core blockchain functions
├── web3_agent.ts       # Agent configuration
└── config.ts          # Model and API configuration
```

### Testing

```bash
# Run development server
pnpm run dev

# Test specific features
# - Token price queries
# - Wallet analysis
# - News aggregation
# - Risk assessment
```

## Deployment

### Docker Build

```bash
# Build container
docker build -t yourusername/web3-agent:latest .

# Run locally
docker run -p 8080:8080 --env-file .env yourusername/web3-agent:latest

# Push to registry
docker push yourusername/web3-agent:latest
```
