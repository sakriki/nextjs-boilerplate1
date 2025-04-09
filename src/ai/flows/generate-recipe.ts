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
  ingredients: z.string().describe('A comma separated list of ingredients available in the fridge. Please be specific with quantities and forms (e.g., "200g cooked chicken breast, 1 diced onion").'),
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
      ingredients: z.string().describe('A comma separated list of ingredients available in the fridge. Please be specific with quantities and forms (e.g., "200g cooked chicken breast, 1 diced onion").'),
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
  prompt: `You are a world-class chef known for your innovative and detailed recipes.

  Based on the ingredients provided, suggest a few recipe ideas. Each recipe should include:
  - A creative and descriptive title
  - A comprehensive list of ingredients with precise quantities
  - Step-by-step instructions that include:
    - Preparation steps
    - Cooking times and temperatures
    - Specific cooking techniques

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

    