// Use server directive needed for Genkit flows.
'use server';
/**
 * @fileOverview Recipe suggestion AI agent.
 *
 * - generateRecipeSuggestions - A function that handles the recipe suggestion process.
 * - GenerateRecipeSuggestionsInput - The input type for the generateRecipeSuggestions function.
 * - GenerateRecipeSuggestionsOutput - The return type for the generateRecipeSuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRecipeSuggestionsInputSchema = z.object({
  ingredients: z.string().describe('A comma separated list of ingredients available in the fridge.'),
});
export type GenerateRecipeSuggestionsInput = z.infer<typeof GenerateRecipeSuggestionsInputSchema>;

const GenerateRecipeSuggestionsOutputSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string().describe('The title of the recipe.'),
      ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
      instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
    })
  ).describe('A list of recipe suggestions based on the given ingredients.'),
});
export type GenerateRecipeSuggestionsOutput = z.infer<typeof GenerateRecipeSuggestionsOutputSchema>;

export async function generateRecipeSuggestions(input: GenerateRecipeSuggestionsInput): Promise<GenerateRecipeSuggestionsOutput> {
  return generateRecipeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeSuggestionsPrompt',
  input: {
    schema: z.object({
      ingredients: z.string().describe('A comma separated list of ingredients available in the fridge.'),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(
        z.object({
          title: z.string().describe('The title of the recipe.'),
          ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
          instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
        })
      ).describe('A list of recipe suggestions based on the given ingredients.'),
    }),
  },
  prompt: `You are a chef specializing in creating recipes based on a given list of ingredients.

  Based on the ingredients provided, suggest a few recipe ideas. Each recipe should include a title, a list of ingredients, and step-by-step instructions.

  Ingredients: {{{ingredients}}}
  Recipes:
  `,
});

const generateRecipeSuggestionsFlow = ai.defineFlow<
  typeof GenerateRecipeSuggestionsInputSchema,
  typeof GenerateRecipeSuggestionsOutputSchema
>({
  name: 'generateRecipeSuggestionsFlow',
  inputSchema: GenerateRecipeSuggestionsInputSchema,
  outputSchema: GenerateRecipeSuggestionsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
