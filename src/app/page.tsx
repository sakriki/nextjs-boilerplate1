'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useState, useRef, useEffect} from 'react';
import {generateRecipeSuggestions} from '@/ai/flows/generate-recipe';
import {GenerateRecipeSuggestionsOutput} from '@/ai/flows/generate-recipe';
import {summarizeRecipe} from '@/ai/flows/summarize-recipe';
import {SummarizeRecipeOutput} from '@/ai/flows/summarize-recipe';
import {Textarea} from '@/components/ui/textarea';
import {Icons} from '@/components/icons';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {createRecipeFromPhoto} from '@/ai/flows/create-recipe-from-photo';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const {toast} = useToast();

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
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  //Recipe from Photo
  const [recipeSuggestionsFromPhoto, setRecipeSuggestionsFromPhoto] = useState<
    {title: string; ingredients: string[]; instructions: string}[] | null
  >(null);

  const handleCreateRecipeFromPhoto = async () => {
    setIsLoading(true);
    try {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const photo = canvas.toDataURL('image/jpeg');

        const recipeSuggestions = await createRecipeFromPhoto({photo});
        setRecipeSuggestionsFromPhoto(recipeSuggestions.recipes);
      }
    } catch (error: any) {
      console.error('Error creating recipe from photo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create recipe from photo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-6 bg-background">
      <header className="mb-8 flex items-center justify-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary food-animation">FridgeChef</h1>
      </header>

      <main className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-xl rounded-2xl border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-primary font-semibold">Recipe Generator</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your ingredients to get recipe suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter ingredients, comma-separated"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="mb-4 rounded-md shadow-sm border-input bg-input text-foreground focus:border-primary focus:ring-primary"
            />
            <Button
              onClick={handleGenerateRecipes}
              className="w-full bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300 micro-interaction"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Recipes'}
            </Button>

            {recipes && recipes.recipes.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-primary">Suggested Recipes:</h3>
                <ul className="list-none pl-0">
                  {recipes.recipes.map((recipe, index) => (
                    <li key={index} className="mb-2">
                      <Button
                        variant="outline"
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full rounded-md shadow-sm border-secondary text-secondary-foreground hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 micro-interaction"
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

        <Card className="shadow-xl rounded-2xl border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-primary font-semibold">Create Recipes from Photos</CardTitle>
            <CardDescription className="text-muted-foreground">
              Take a photo of your ingredients to get recipe suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {hasCameraPermission ? (
              <>
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                <Button
                  onClick={handleCreateRecipeFromPhoto}
                  className="mt-4 bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-300 micro-interaction"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : <Icons.camera className="mr-2" />}
                  {isLoading ? 'Generating...' : 'Generate Recipes from Photo'}
                </Button>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
              </Alert>
            )}

            {recipeSuggestionsFromPhoto && recipeSuggestionsFromPhoto.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-primary">Suggested Recipes from Photo:</h3>
                <ul className="list-none pl-0">
                  {recipeSuggestionsFromPhoto.map((recipe, index) => (
                    <li key={index} className="mb-2">
                      <Button
                        variant="outline"
                        onClick={() => handleRecipeClick(recipe)}
                        className="w-full rounded-md shadow-sm border-secondary text-secondary-foreground hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 micro-interaction"
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

        <Card className="shadow-xl rounded-2xl border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-primary font-semibold">Recipe Summary</CardTitle>
            <CardDescription className="text-muted-foreground">View the selected recipe and its summary.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRecipe ? (
              <div>
                <h3 className="mb-2 font-semibold text-primary">{selectedRecipe.title}</h3>
                <p className="mb-4 text-muted-foreground">
                  <span className="font-semibold text-primary">Instructions:</span>
                  <br />
                  {selectedRecipe.instructions}
                </p>
                {recipeSummary && (
                  <div>
                    <h4 className="mb-2 font-semibold text-primary">Summary:</h4>
                    <p className="text-muted-foreground">{recipeSummary.summary}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No recipe selected.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
