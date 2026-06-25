import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Financial Analysis
  app.post("/api/analyze", async (req: any, res: any) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "GEMINI_API_KEY is not configured. Please set it in Settings > Secrets." 
        });
      }

      const { income, expenses, savings, goal, riskTolerance, expenseBreakdown } = req.body;

      if (!income || !expenses || !goal) {
        return res.status(400).json({ error: "Missing required parameters: income, expenses, and goal are required." });
      }

      // Initialize Google GenAI client lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        You are an expert Certified Personal Financial Planner (CFP).
        Analyze the following financial situation and provide concrete, realistic, numbers-driven advice:
        
        User Details:
        - Monthly Income (Net): $${income}
        - Total Monthly Expenses: $${expenses}
        - Current Savings: $${savings || 0}
        - Financial Goal: "${goal}"
        - Risk Appetite: ${riskTolerance || 'Moderate'}
        - Categorized Spending (Approximate Monthly):
          ${JSON.stringify(expenseBreakdown || {}, null, 2)}
        
        Provide:
        1. A realistic Financial Health Score (0-100). Be objective: score low if they spend more than they earn, have $0 savings, or high debt. Score high if they have an active savings rate >20% and solid emergency reserves.
        2. A complete budget breakdown matching their categories, showing actual vs recommended spending amounts (recommended should align roughly with the 50/30/20 rule, adjusted for their specific income level and goal).
        3. Real areas of overspending (where actual spending exceeds recommendations), with practical lifestyle substitutes/alternatives and exact potential monthly savings.
        4. Structured savings recommendations to optimize expenses and reach their goal.
        5. Specific monthly investment suggestions based on their surplus and "${riskTolerance || 'Moderate'}" risk tolerance.
        6. A direct risk assessment covering emergency fund coverage, expense ratios, or debt levels.
        7. A clear, immediate 3-Step Action Plan with specific completion timelines.
        
        Always structure your response strictly inside the provided JSON schema. Ensure descriptions are highly personalized, realistic, and use correct formatting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional, caring, and practical certified personal finance planner who gives realistic advice with specific numbers and lifestyle strategies.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: {
                type: Type.INTEGER,
                description: "Calculated Financial Health Score (0-100)."
              },
              healthScoreExplanation: {
                type: Type.STRING,
                description: "Clear, encouraging but realistic explanation of why they got this score, citing their specific metrics."
              },
              budgetBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "Expense category (e.g., Housing, Food, Transport, Utilities, Fun/Wants, Savings, Debt, Medical, Others)." },
                    actualAmount: { type: Type.NUMBER },
                    recommendedAmount: { type: Type.NUMBER },
                    percentageOfIncome: { type: Type.NUMBER },
                    status: { type: Type.STRING, description: "Must be 'good', 'warning', or 'critical'." },
                    advice: { type: Type.STRING, description: "Personalized advice to optimize or maintain spending in this category." }
                  },
                  required: ["category", "actualAmount", "recommendedAmount", "percentageOfIncome", "status", "advice"]
                }
              },
              overspendingAreas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    severity: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'." },
                    potentialSavings: { type: Type.NUMBER, description: "Realistic monthly dollar savings." },
                    practicalAlternative: { type: Type.STRING, description: "Lifestyle alternative or tip (e.g., 'Cook Sunday batches instead of dinner deliveries')." }
                  },
                  required: ["category", "severity", "potentialSavings", "practicalAlternative"]
                }
              },
              savingsRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    monthlyTarget: { type: Type.NUMBER },
                    expectedImpact: { type: Type.STRING }
                  },
                  required: ["title", "description", "monthlyTarget", "expectedImpact"]
                }
              },
              investmentSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    assetClass: { type: Type.STRING, description: "Instrument or asset class (e.g., 'S&P 500 Index Funds', 'High-Yield Savings (HYSA)', 'Bonds', etc.)" },
                    suggestedAllocationPercentage: { type: Type.INTEGER, description: "Percentage allocation (0-100)" },
                    expectedReturnRange: { type: Type.STRING, description: "Expected interest rate or return range (e.g. '4.5% - 5.0% APY', '8% - 10% annual average')" },
                    whyItFits: { type: Type.STRING, description: "Why it fits their specific goal and risk appetite." }
                  },
                  required: ["assetClass", "suggestedAllocationPercentage", "expectedReturnRange", "whyItFits"]
                }
              },
              riskAssessment: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    riskType: { type: Type.STRING, description: "Type of risk assessed (e.g. 'Emergency Fund Adequacy', 'Over-leveraged Debt', 'Income Volatility')" },
                    rating: { type: Type.STRING, description: "Must be 'safe', 'moderate', or 'high'." },
                    details: { type: Type.STRING }
                  },
                  required: ["riskType", "rating", "details"]
                }
              },
              threeStepActionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    timeline: { type: Type.STRING }
                  },
                  required: ["step", "title", "description", "timeline"]
                }
              }
            },
            required: [
              "healthScore",
              "healthScoreExplanation",
              "budgetBreakdown",
              "overspendingAreas",
              "savingsRecommendations",
              "investmentSuggestions",
              "riskAssessment",
              "threeStepActionPlan"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text returned from Gemini API.");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Analysis API Error:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during financial analysis." });
    }
  });

  // Serve static assets & connect Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
