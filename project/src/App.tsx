import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, Mic, Camera, Scale, X } from 'lucide-react';
import Button from './components/Button';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recipeText, setRecipeText] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
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
        
        // Auto scroll to bottom
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

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const validateInput = (text: string) => {
    if (!text.trim()) {
      setError('Please enter your recipe text');
      return false;
    }
    if (!text.match(/\d+\s*(cup|tbsp|tsp|oz|ml|g|kg|pound|lb)/i)) {
      setError('Please include measurements in your recipe (e.g., cups, tbsp, tsp)');
      return false;
    }
    setError('');
    return true;
  };

  const validateImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return false;
    }

    setImageError('');
    return true;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImage(file)) {
      setSelectedImage(null);
      return;
    }

    setIsUploading(true);
    
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);

    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const handleConvert = () => {
    if (validateInput(recipeText)) {
      console.log('Converting recipe:', recipeText);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setImageError('');
  };

  const copyTranscription = () => {
    navigator.clipboard.writeText(transcription);
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
            Transform your recipes from volume to weight measurements instantly. Speak, snap, or type your ingredients for precise conversions.
          </p>
        </div>

        {/* Input Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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

          {/* Photo Input */}
          <div className="card group">
            <div className="text-center mb-6">
              <div className="card-icon bg-[--secondary]/10">
                <Camera className="h-6 w-6 text-[--secondary]" />
              </div>
              <h3 className="text-lg font-semibold">Photo Recognition</h3>
              <p className="text-gray-600 mt-2">Upload photos of your measuring tools</p>
            </div>
            
            {selectedImage ? (
              <div className="relative mb-4">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ) : null}
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="photo-upload"
              onChange={handlePhotoUpload}
            />
            {imageError && (
              <div className="text-red-500 text-sm mb-2">{imageError}</div>
            )}
            <Button 
              className="w-full"
              variant="outline"
              loading={isUploading}
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              {selectedImage ? 'Change Photo' : 'Upload Photo'}
            </Button>
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
              Your converted measurements will appear here after processing your recipe.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>© 2025 PreciseBake. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;