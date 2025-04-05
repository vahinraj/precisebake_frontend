import { useState, useRef, useEffect } from 'react';
import { ChefHat, Mic, Scale, } from 'lucide-react';
import Button from './components/Button';





function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [error, setError] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptionRef = useRef<HTMLTextAreaElement>(null);
  const [convertedRecipe, setConvertedRecipe] = useState<string>('');  // Added state for converted recipe


      useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Set continuous to false
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => {
                setIsTranscribing(true);
            };

            recognitionRef.current.onend = () => {
                setIsTranscribing(false);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
                setTranscription(finalTranscript);

                if (transcriptionRef.current) {
                    transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                setIsTranscribing(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleRecording = async () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }


        if (isRecording) {
            recognitionRef.current.stop();

            // API call moved here:
            if (validateInput(transcription)) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ recipeText: transcription }), // Use transcription
                    });
                    const data = await response.json();
                    setConvertedRecipe(data.formatted_recipe);
                    console.log('Converted Recipe:', data.formatted_recipe);
                } catch (error) {
                    console.error('Error converting recipe:', error);
                    alert('Failed to convert recipe. Please try again.');
                }
            }

        } else {
            setTranscription(''); // Clear transcription
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

  const validateInput = (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
        setError('Please enter your recipe text');
        return false;
    }

    // Check if the text contains at least one measurement unit
    if (!trimmedText.match(/\b(cup|cups|tbsp|tsp|oz|ml|g|kg|pound|lb|tablespoon|teaspoon|tablespoons|teaspoons|spoon|spoons|fl oz|fluid ounce|fluid ounces|mL|milliliter|milliliters|ounce|ounces|lbs|pounds)\b/i)) {
        setError('Please include measurements in your recipe (e.g., cups, tbsp, tsp)');
        return false;
    }

    setError('');
    return true;
};



   const handleConvert = async () => {
    if (validateInput(recipeText)) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeText })
            });
            if (!response.ok) {
              throw new Error("Backend is still starting up or unavailable.");
            }

            const data = await response.json();

            setConvertedRecipe(data.formatted_recipe); // Set the response to state

        } catch (error) {
            console.error('Error converting recipe:', error);
            alert('Failed to convert recipe. Please try again.');
        }
    }
};





const copyTranscription = () => {
  navigator.clipboard.writeText(transcription)
    .then(() => alert('Copied successfully!'))
    .catch((err) => console.error('Failed to copy:', err));
};


  return (
    <div className="min-h-screen bg-[--background]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-[--primary]" />
              <h1 className="text-2xl font-bold text-gray-900">PreciseBake</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Recipe Measurements with AI Precision
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your recipes from volume to weight measurements instantly. Speak or type your ingredients for precise conversions.
          </p>
        </div>

        {/* Input Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 ">
          {/* Voice Input */}
          <div className="card group">
            <div className="text-center mb-6">
              <div className="card-icon bg-[--primary]/10">
                <Mic className="h-6 w-6 text-[--primary]" />
              </div>
              <h3 className="text-lg font-semibold">Voice Recognition</h3>
              <p className="text-gray-600 mt-2">Dictate your recipe ingredients and measurements</p>
            </div>
            <div className="relative mb-4">
              <textarea
                ref={transcriptionRef}
                className={`w-full h-32 p-3 border rounded-lg resize-none font-medium ${
                  isTranscribing ? 'border-[--primary]' : 'border-gray-300'
                } focus:ring-2 focus:ring-[--primary] focus:border-[--primary]`}
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Your speech will appear here..."
              />
              {isTranscribing && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[--primary] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[--primary] rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-[--primary] rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                className="flex-1"
                onClick={toggleRecording}
                variant={isRecording ? 'primary' : 'outline'}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button
                className="flex-none"
                variant="outline"
                onClick={copyTranscription}
                disabled={!transcription}
              >
                Copy
              </Button>
            </div>
          </div>


          {/* Manual Input */}
          <div className="card">
            <div className="text-center mb-6">
              <div className="card-icon bg-[--accent]/10">
                <Scale className="h-6 w-6 text-[--accent]" />
              </div>
              <h3 className="text-lg font-semibold">Manual Input</h3>
              <p className="text-gray-600 mt-2">Type your recipe measurements</p>
            </div>
            <div className="relative">
              <textarea
                className={`w-full h-24 p-3 border rounded-lg mb-2 focus:ring-2 focus:ring-[--primary] focus:border-[--primary] transition-all duration-300 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your recipe here..."
                value={recipeText}
                onChange={(e) => {
                  setRecipeText(e.target.value);
                  if (error) validateInput(e.target.value);
                }}
              />
              <div className={`input-error ${error ? 'visible' : ''}`}>
                {error}
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleConvert}
            >
              Convert Recipe
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="card">
          <div className="flex justify-center mb-6">
            <h3 className="text-2xl font-semibold">Converted Measurements</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 text-center">
              {convertedRecipe.match(/\d+\.\d+.*?(?=\d+\.\d+|$)/gs)?.map((line, index) => (
                <span key={index}> 
                  {line.trim()}
                  <br />
                </span>
             ))}      
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>PreciseBake • Project Demo • 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
