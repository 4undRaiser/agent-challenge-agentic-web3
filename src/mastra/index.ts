import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";

import { web3Agent } from "./agents/agentic_web3/web3_agent"; // Web3 Agent with comprehensive crypto tools

export const mastra = new Mastra({
	
	agents: { web3Agent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
