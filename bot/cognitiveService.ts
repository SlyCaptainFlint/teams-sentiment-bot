import { TextAnalyticsClient, AzureKeyCredential, TextDocumentInput, AnalyzeSentimentSuccessResult, SentimentConfidenceScores } from "@azure/ai-text-analytics";
import * as dotenv from "dotenv";

// Read environment variables from file
dotenv.config({ path: '../.fx/local.env' });
const endpoint = process.env["AZURE_COGNITIVE_SERVICES_ENDPOINT"];
const apiKey = process.env["COGNITIVE_SERVICES_API_KEY"]; 

interface AnalysisResult {
    sentence: string;
    sentiment: string;
    confidence: ConfidenceScores;
}

interface ConfidenceScores{
    negative: number;
    positive: number;
    neutral: number;
}

export interface AnalysisResults {
    overallSentiment: string
    confidence: ConfidenceScores;
    sentenceAnalysisResults: AnalysisResult[];
}

export async function analyze(textToAnalyze: string): Promise<AnalysisResults> {
    const document: TextDocumentInput[] = [{
        id: "0",
        language: "en",
        text: textToAnalyze
    }];
    const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
    const results = await client.analyzeSentiment(document);
    
    for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (!result.error) {
            const successResult = result as AnalyzeSentimentSuccessResult;
            let sentenceAnalysisResults = [];
            for (const { sentiment, confidenceScores, text } of successResult.sentences) {                
                sentenceAnalysisResults.push({sentence: text, sentiment, confidence: convertConfidenceToPercentage(confidenceScores)});                
                
            }

            return {
                sentenceAnalysisResults: sentenceAnalysisResults, 
                overallSentiment: successResult.sentiment,
                confidence: convertConfidenceToPercentage(successResult.confidenceScores)
            };

        } else {
            return null;
        }
    }
}

function convertConfidenceToPercentage(confidenceScores: SentimentConfidenceScores){
    return {
        positive: confidenceScores.positive * 100,
        negative: confidenceScores.negative * 100,
        neutral: confidenceScores.neutral * 100
    }
}