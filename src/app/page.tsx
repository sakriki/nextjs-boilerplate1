'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {generateRecipeSuggestions} from '@/ai/flows/generate-recipe';
import {GenerateRecipeSuggestionsOutput} from '@/ai/flows/generate-recipe';
import {summarizeRecipe} from '@/ai/flows/summarize-recipe';
import {SummarizeRecipeOutput} from '@/ai/flows/summarize-recipe';
import {Textarea} from '@/components/ui/textarea';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<GenerateRecipeSuggestionsOutput | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<{
    title: string;
    ingredients: string;
    instructions: string;
  } | null>(null);
  const [recipeSummary, setRecipeSummary] = useState<SummarizeRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRecipes = async () => {
    setIsLoading(true);
    try {
      const recipeSuggestions = await generateRecipeSuggestions({ingredients});
      setRecipes(recipeSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeClick = async (recipe: {title: string; ingredients: string[]; instructions: string}) => {
    setSelectedRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions,
    });

    setIsLoading(true);
    try {
      const summary = await summarizeRecipe({
        recipeTitle: recipe.title,
        ingredients: recipe.ingredients.join('\n'),
        instructions: recipe.instructions,
      });
      setRecipeSummary(summary);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-br from-green-50 to-green-100">
      <header className="mb-8 flex items-center justify-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-green-800">FridgeChef</h1>
      </header>

      <main className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-green-50 shadow-xl rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="text-green-900 font-semibold">Recipe Generator</CardTitle>
            <CardDescription className="text-green-700">Enter your ingredients to get recipe suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter ingredients, comma-separated"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="mb-4 rounded-md shadow-sm border-green-300 focus:border-green-500 focus:ring-green-500"
            />
            <Button
              onClick={handleGenerateRecipes}
              className="w-full bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-300 disabled:bg-green-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Recipes'}
            </Button>

            {recipes && recipes.recipes.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-green-800">Suggested Recipes:</h3>
                <ul className="list-none pl-0">
                  {recipes.recipes.map((recipe, index) => (
                    <li key={index} className="mb-2">
                      <Button
                        variant="outline"
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full rounded-md shadow-sm border-green-300 text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
                      >
                        {recipe.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-green-50 shadow-xl rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="text-green-900 font-semibold">Recipe Summary</CardTitle>
            <CardDescription className="text-green-700">View the selected recipe and its summary.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRecipe ? (
              <div>
                <h3 className="mb-2 font-semibold text-green-800">{selectedRecipe.title}</h3>
                <p className="mb-4 text-green-700">
                  <span className="font-semibold text-green-800">Instructions:</span>
                  <br />
                  {selectedRecipe.instructions}
                </p>
                {recipeSummary && (
                  <div>
                    <h4 className="mb-2 font-semibold text-green-800">Summary:</h4>
                    <p className="text-green-700">{recipeSummary.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-green-700">No recipe selected.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
