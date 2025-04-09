'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {generateRecipeSuggestions} from '@/ai/flows/generate-recipe';
import {GenerateRecipeSuggestionsOutput} from '@/ai/flows/generate-recipe';
import {summarizeRecipe} from '@/ai/flows/summarize-recipe';
import {SummarizeRecipeOutput} from '@/ai/flows/summarize-recipe';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<GenerateRecipeSuggestionsOutput | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<{
    title: string;
    ingredients: string;
    instructions: string;
  } | null>(null);
  const [recipeSummary, setRecipeSummary] = useState<SummarizeRecipeOutput | null>(null);

  const handleGenerateRecipes = async () => {
    const recipeSuggestions = await generateRecipeSuggestions({ingredients});
    setRecipes(recipeSuggestions);
  };

  const handleRecipeClick = async (recipe: {title: string; ingredients: string[]; instructions: string}) => {
    setSelectedRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions,
    });

    const summary = await summarizeRecipe({
      recipeTitle: recipe.title,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions,
    });
    setRecipeSummary(summary);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">FridgeChef</h1>
      </header>

      <main className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Recipes</CardTitle>
            <CardDescription>Suggest recipes based on ingredients.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter ingredients, comma-separated"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleGenerateRecipes} className="w-full">
              Generate
            </Button>

            {recipes && recipes.recipes.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold">Suggested Recipes:</h3>
                <ul>
                  {recipes.recipes.map((recipe, index) => (
                    <li key={index}>
                      <Button variant="link" onClick={() => handleRecipeClick(recipe)}>
                        {recipe.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipe Summary</CardTitle>
            <CardDescription>View details and summary of selected recipe.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRecipe ? (
              <div>
                <h3 className="mb-2 font-semibold">{selectedRecipe.title}</h3>
                <p className="mb-2">
                  <span className="font-semibold">Ingredients:</span>
                  <br />
                  {selectedRecipe.ingredients}
                </p>
                <p className="mb-4">
                  <span className="font-semibold">Instructions:</span>
                  <br />
                  {selectedRecipe.instructions}
                </p>
                {recipeSummary && (
                  <div>
                    <h4 className="mb-2 font-semibold">Summary:</h4>
                    <p>{recipeSummary.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>No recipe selected.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
