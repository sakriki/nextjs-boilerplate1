'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {generateRecipeSuggestions} from '@/ai/flows/generate-recipe';
import {GenerateRecipeSuggestionsOutput} from '@/ai/flows/generate-recipe';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<GenerateRecipeSuggestionsOutput | null>(null);

  const handleGenerateRecipes = async () => {
    const recipeSuggestions = await generateRecipeSuggestions({ingredients});
    setRecipes(recipeSuggestions);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10">
      <h1 className="text-4xl font-bold mb-6">FridgeChef</h1>
      <div className="flex flex-col items-center w-full max-w-md">
        <Input
          type="text"
          placeholder="Enter ingredients separated by commas"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleGenerateRecipes} className="bg-accent text-foreground hover:bg-accent-foreground hover:text-background">
          Generate Recipes
        </Button>
      </div>

      {recipes && recipes.recipes.length > 0 ? (
        <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
          {recipes.recipes.map((recipe, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
                <CardDescription>A delicious recipe idea</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
                <ul className="list-disc pl-5 mb-4">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                <p>{recipe.instructions}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="mt-6">No recipes generated yet. Enter some ingredients and click &quot;Generate Recipes&quot;.</p>
      )}
    </div>
  );
}
