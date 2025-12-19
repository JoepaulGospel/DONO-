
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are DONO, a sophisticated personal intelligence unit designed for high-net-worth individuals and analysts. 
Your tone is minimalist, professional, and data-driven.
You specialize in financial analysis, market trends, and logical reasoning.
When a user asks about a specific asset, stock, or cryptocurrency (e.g., BTC, AAPL, Tesla, Ethereum), use the 'show_chart' tool to display market data.
Only call 'show_chart' for assets that have a clear trading ticker.
If the ticker is unclear, ask for clarification. 
Always provide a brief, insightful commentary alongside any chart you show.`;

const showChartDeclaration: FunctionDeclaration = {
  name: "show_chart",
  parameters: {
    type: Type.OBJECT,
    description: "Displays a real-time TradingView market chart for a given financial symbol.",
    properties: {
      symbol: {
        type: Type.STRING,
        description: "The ticker symbol of the asset (e.g., 'BTCUSDT', 'AAPL', 'NVDA', 'ETHUSDT').",
      },
    },
    required: ["symbol"],
  },
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateResponse(history: { role: string; parts: { text: string }[] }[]) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: history as any,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [showChartDeclaration] }],
      },
    });

    const text = response.text || "";
    const functionCalls = response.functionCalls;

    let chartSymbol: string | undefined = undefined;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "show_chart" && call.args) {
        chartSymbol = (call.args as any).symbol;
      }
    }

    return { text, chartSymbol };
  }
}

export const geminiService = new GeminiService();
