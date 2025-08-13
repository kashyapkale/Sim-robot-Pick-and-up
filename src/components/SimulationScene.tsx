'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location, GameObject } from '@/types/game';

interface SimulationSceneProps {
  gameObjects: GameObject[];
  locations: Location[];
  selectedObject: GameObject | null;
  targetLocation: Location | null;
  isAnimating: boolean;
}

export default function SimulationScene({
  gameObjects,
  locations,
  selectedObject,
  targetLocation,
  isAnimating,
}: SimulationSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  // Find object at a specific location (for future use)
  // const getObjectAtLocation = (locationId: string) => {
  //   return gameObjects.find(obj => obj.location === locationId);
  // };

  // Get location coordinates
  const getLocationCoords = (locationId: string) => {
    return locations.find(loc => loc.id === locationId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Simulation Room</h2>
      
      <div 
        ref={sceneRef}
        className="relative w-full h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300 overflow-hidden"
      >
        {/* Room Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
        
        {/* Robotic Hands */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={isAnimating ? {
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{ duration: 2, repeat: isAnimating ? Infinity : 0 }}
            className="flex space-x-4"
          >
            {/* Left Robotic Hand */}
            <div className="w-16 h-20 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full relative">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-500 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gray-700 rounded-full"></div>
            </div>
            
            {/* Right Robotic Hand */}
            <div className="w-16 h-20 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full relative">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-500 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gray-700 rounded-full"></div>
            </div>
          </motion.div>
        </div>

        {/* Location Markers */}
        {locations.map((location) => (
          <div
            key={location.id}
            className="absolute w-16 h-16 flex items-center justify-center"
            style={{ left: location.x, top: location.y }}
          >
            <div className="w-full h-full border-2 border-blue-500 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-700">{location.label}</span>
            </div>
          </div>
        ))}

        {/* Game Objects */}
        <AnimatePresence>
          {gameObjects.map((obj) => {
            const location = getLocationCoords(obj.location);
            if (!location) return null;

            const isSelected = selectedObject?.id === obj.id;
            const isTarget = targetLocation?.id === obj.location;

            return (
              <motion.div
                key={obj.id}
                className="absolute w-20 h-20 cursor-pointer"
                style={{ left: location.x - 10, top: location.y - 10 }}
                animate={isAnimating && isSelected ? {
                  scale: [1, 1.2, 1],
                  y: [0, -50, 0],
                  rotate: [0, 360],
                } : {}}
                transition={{ duration: 2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className={`w-full h-full rounded-lg border-2 ${
                  isSelected ? 'border-yellow-500 bg-yellow-100' : 
                  isTarget ? 'border-green-500 bg-green-100' : 
                  'border-gray-400 bg-white'
                } flex items-center justify-center shadow-lg`}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center mb-1">
                      <span className="text-white text-xs font-bold">{obj.type.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{obj.name}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Animation Path (when moving objects) */}
        {isAnimating && selectedObject && targetLocation && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <motion.path
              d={`M ${getLocationCoords(selectedObject.location)?.x || 0} ${getLocationCoords(selectedObject.location)?.y || 0} L ${targetLocation.x} ${targetLocation.y}`}
              stroke="url(#gradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              animate={{
                strokeDashoffset: [0, -15],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Room Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-300 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-300 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-300 to-transparent"></div>
      </div>

      {/* Scene Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded"></div>
          <span className="text-gray-600">Location Markers</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
          <span className="text-gray-600">Game Objects</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
          <span className="text-gray-600">Selected Object</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-gray-600">Target Location</span>
        </div>
      </div>
    </div>
  );
} 