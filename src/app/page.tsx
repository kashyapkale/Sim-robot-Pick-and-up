'use client';

import { useState, useRef } from 'react';
import { Upload, Play, RotateCcw } from 'lucide-react';
import ThreeJSRoboticArm from '@/components/ThreeJSRoboticArm';
import { Location, GameObject } from '@/types/game';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [targetLocation, setTargetLocation] = useState<Location | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging for state changes
  console.log('🎯 [PAGE_STATE] Current state:', {
    selectedObject,
    selectedObjectType: typeof selectedObject,
    selectedObjectKeys: selectedObject ? Object.keys(selectedObject) : null,
    targetLocation,
    targetLocationType: typeof targetLocation,
    targetLocationKeys: targetLocation ? Object.keys(targetLocation) : null,
    isAnimating
  });

  // Game state
  const [gameObjects, setGameObjects] = useState<GameObject[]>([
    { id: 1, name: 'brick', type: 'brick', location: 'A', image: '/objects/brick.png' },
    { id: 2, name: 'chair', type: 'chair', location: 'B', image: '/objects/chair.png' },
    { id: 3, name: 'table', type: 'table', location: 'C', image: '/objects/table.png' },
    { id: 4, name: 'book', type: 'book', location: 'D', image: '/objects/book.png' },
  ]);

  const locations: Location[] = [
    { id: 'A', x: 100, y: 200, label: 'A' },
    { id: 'B', x: 300, y: 200, label: 'B' },
    { id: 'C', x: 500, y: 200, label: 'C' },
    { id: 'D', x: 100, y: 400, label: 'D' },
    { id: 'E', x: 300, y: 400, label: 'E' },
    { id: 'F', x: 500, y: 400, label: 'F' },
    { id: 'G', x: 100, y: 600, label: 'G' },
    { id: 'H', x: 300, y: 600, label: 'H' },
    { id: 'I', x: 500, y: 600, label: 'I' },
    { id: 'J', x: 700, y: 400, label: 'J' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!prompt) return; // Only prompt is required now

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      // Only append image if it exists
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }

      const response = await fetch('/api/process-intent', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('🎮 [API_RESPONSE] Full API Response:', result);
      console.log('🎮 [API_RESPONSE] Object structure:', {
        object: result.object,
        objectType: typeof result.object,
        objectKeys: result.object ? Object.keys(result.object) : null,
        location: result.location,
        locationType: typeof result.location,
        locationKeys: result.location ? Object.keys(result.location) : null
      });
      
      if (result.success) {
        console.log('✅ [STATE_UPDATE] Setting game state:', { 
          object: result.object, 
          location: result.location 
        });
        console.log('✅ [STATE_UPDATE] About to call setSelectedObject with:', result.object);
        console.log('✅ [STATE_UPDATE] About to call setTargetLocation with:', result.location);
        
        setSelectedObject(result.object);
        setTargetLocation(result.location);
        setIsAnimating(true);
        
        // Simulate animation completion
        setTimeout(() => {
          console.log('🎬 Animation completed, updating game objects');
          setIsAnimating(false);
          // Update game state
          if (result.object && result.location) {
            setGameObjects(prev => {
              const updated = prev.map(obj => 
                obj.id === result.object.id 
                  ? { ...obj, location: result.location.id }
                  : obj
              );
              console.log('🔄 Updated game objects:', updated);
              return updated;
            });
          }
        }, 3000);
      } else {
        console.log('❌ API returned error:', result.message);
      }
    } catch (error) {
      console.error('Error processing intent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    setGameObjects([
      { id: 1, name: 'brick', type: 'brick', location: 'A', image: '/objects/brick.png' },
      { id: 2, name: 'chair', type: 'chair', location: 'B', image: '/objects/chair.png' },
      { id: 3, name: 'table', type: 'table', location: 'C', image: '/objects/table.png' },
      { id: 4, name: 'book', type: 'book', location: 'D', image: '/objects/book.png' },
    ]);
    setPrompt('');
    setUploadedImage(null);
    setImagePreview('');
    setSelectedObject(null);
    setTargetLocation(null);
    setIsAnimating(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Robotic Simulation Game
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Game Controls</h2>
            
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Pick and place it on location B"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Object Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setImagePreview('');
                        setUploadedImage(null);
                      }}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Click to upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={!prompt || isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Execute Action</span>
                  </>
                )}
              </button>

              <button
                onClick={resetGame}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset Game</span>
              </button>
            </div>

            {/* Game Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Game Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Objects:</span>
                  <span className="font-medium">{gameObjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locations:</span>
                  <span className="font-medium">{locations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${isAnimating ? 'text-blue-600' : 'text-green-600'}`}>
                    {isAnimating ? 'Animating...' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - 3D Simulation Scene */}
          <div className="lg:col-span-2">
            <ThreeJSRoboticArm
              gameObjects={gameObjects}
              locations={locations}
              selectedObject={selectedObject}
              targetLocation={targetLocation}
              isAnimating={isAnimating}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
