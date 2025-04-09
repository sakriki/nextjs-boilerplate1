'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import {generateRecipeSuggestions} from '@/ai/flows/generate-recipe';
import {GenerateRecipeSuggestionsOutput} from '@/ai/flows/generate-recipe';
import {summarizeRecipe} from '@/ai/flows/summarize-recipe';
import {SummarizeRecipeOutput} from '@/ai/flows/summarize-recipe';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import * as Recharts from 'recharts';

const data = [
  {name: 'Dairy', value: 400},
  {name: 'Vegetables', value: 300},
  {name: 'Fruits', value: 300},
  {name: 'Grains', value: 200},
];

const chartConfig = {
  dairy: {
    label: 'Dairy',
    color: 'hsl(var(--chart-1))',
  },
  vegetables: {
    label: 'Vegetables',
    color: 'hsl(var(--chart-2))',
  },
  fruits: {
    label: 'Fruits',
    color: 'hsl(var(--chart-3))',
  },
  grains: {
    label: 'Grains',
    color: 'hsl(var(--chart-4))',
  },
};

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<GenerateRecipeSuggestionsOutput | null>(null);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [recipeSummary, setRecipeSummary] = useState<SummarizeRecipeOutput | null>(null);

  const handleGenerateRecipes = async () => {
    const recipeSuggestions = await generateRecipeSuggestions({ingredients});
    setRecipes(recipeSuggestions);
  };

  const handleSummarizeRecipe = async () => {
    const summary = await summarizeRecipe({
      recipeTitle: recipeTitle,
      ingredients: recipeIngredients,
      instructions: recipeInstructions,
    });
    setRecipeSummary(summary);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">FridgeChef</h1>
      </header>

      <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <li key={index}>{recipe.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summarize Recipe</CardTitle>
            <CardDescription>Get a quick summary of any recipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Recipe Title"
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Ingredients"
              value={recipeIngredients}
              onChange={(e) => setRecipeIngredients(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Instructions"
              value={recipeInstructions}
              onChange={(e) => setRecipeInstructions(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleSummarizeRecipe} className="w-full">
              Summarize
            </Button>

            {recipeSummary && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold">Summary:</h3>
                <p>{recipeSummary.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Ingredient Usage</CardTitle>
            <CardDescription>Overview of ingredient consumption.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <Recharts.PieChart>
                <Recharts.Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#8884d8"
                >
                  {data.map((entry, index) => (
                    <Recharts.Cell key={`cell-${index}`} fill={chartConfig[entry.name.toLowerCase()]?.color || '#000'} />
                  ))}
                </Recharts.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </Recharts.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
