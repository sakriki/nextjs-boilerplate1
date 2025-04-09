'use server';
/**
 * @fileOverview Recipe summarization AI agent.
 *
 * - summarizeRecipe - A function that handles the recipe summarization process.
 * - SummarizeRecipeInput - The input type for the summarizeRecipe function.
 * - SummarizeRecipeOutput - The return type for the summarizeRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeRecipeInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  ingredients: z.string().describe('A list of the ingredients in the recipe.'),
  instructions: z.string().describe('The full instructions for the recipe.'),
});
export type SummarizeRecipeInput = z.infer<typeof SummarizeRecipeInputSchema>;

const SummarizeRecipeOutputSchema = z.object({
  summary: z.string().describe('A short summary of the recipe.'),
});
export type SummarizeRecipeOutput = z.infer<typeof SummarizeRecipeOutputSchema>;

export async function summarizeRecipe(input: SummarizeRecipeInput): Promise<SummarizeRecipeOutput> {
  return summarizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecipePrompt',
  input: {
    schema: z.object({
      recipeTitle: z.string().describe('The title of the recipe.'),
      ingredients: z.string().describe('A list of the ingredients in the recipe.'),
      instructions: z.string().describe('The full instructions for the recipe.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A short summary of the recipe.'),
    }),
  },
  prompt: `You are a recipe summarization expert.

  Please provide a concise summary of the recipe described below. Focus on the key steps and overall flavor profile.

  Recipe Title: {{{recipeTitle}}}
  Ingredients: {{{ingredients}}}
  Instructions: {{{instructions}}}
  Summary:`,
});

const summarizeRecipeFlow = ai.defineFlow<
  typeof SummarizeRecipeInputSchema,
  typeof SummarizeRecipeOutputSchema
>(
  {
    name: 'summarizeRecipeFlow',
    inputSchema: SummarizeRecipeInputSchema,
    outputSchema: SummarizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
