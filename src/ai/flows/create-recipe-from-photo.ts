'use server';

/**
 * @fileOverview AI agent that generates recipe suggestions from a photo.
 *
 * - createRecipeFromPhoto - A function that handles the recipe generation process from a photo.
 * - CreateRecipeFromPhotoInput - The input type for the createRecipeFromPhoto function.
 * - CreateRecipeFromPhotoOutput - The return type for the createRecipeFromPhoto function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CreateRecipeFromPhotoInputSchema = z.object({
  photo: z.string().describe('The data URL of the photo containing ingredients.'),
});

export type CreateRecipeFromPhotoInput = z.infer<typeof CreateRecipeFromPhotoInputSchema>;

const CreateRecipeFromPhotoOutputSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string().describe('The title of the recipe.'),
      ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
      instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
    })
  ).describe('A list of recipe suggestions based on the ingredients in the photo.'),
});

export type CreateRecipeFromPhotoOutput = z.infer<typeof CreateRecipeFromPhotoOutputSchema>;

export async function createRecipeFromPhoto(input: CreateRecipeFromPhotoInput): Promise<CreateRecipeFromPhotoOutput> {
  return createRecipeFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createRecipeFromPhotoPrompt',
  input: {
    schema: z.object({
      photo: z.string().describe('The data URL of the photo containing ingredients.'),
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
      ).describe('A list of recipe suggestions based on the ingredients in the photo.'),
    }),
  },
  prompt: `You are an expert chef who can identify ingredients from a photo and suggest recipes.
  Based on the ingredients identified in the photo, suggest a few recipe ideas. Each recipe should include:
  - A creative and descriptive title
  - A comprehensive list of ingredients with precise quantities
  - Step-by-step instructions that include:
    - Preparation steps
    - Cooking times and temperatures
    - Specific cooking techniques
  Photo: {{media url=photo}}
  Recipes:
  `,
});

const createRecipeFromPhotoFlow = ai.defineFlow<
  typeof CreateRecipeFromPhotoInputSchema,
  typeof CreateRecipeFromPhotoOutputSchema
>({
  name: 'createRecipeFromPhotoFlow',
  inputSchema: CreateRecipeFromPhotoInputSchema,
  outputSchema: CreateRecipeFromPhotoOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
