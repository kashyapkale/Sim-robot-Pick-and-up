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
        {/* Industrial Room Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-70"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        {/* Industrial Robotic Arms */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-12">
            {/* Left Robotic Arm - Picker */}
            <motion.div
              className="relative"
              animate={isAnimating && selectedObject ? {
                y: [0, -20, 0],
              } : {}}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              {/* Base */}
              <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-3 shadow-lg"></div>
              
              {/* Arm Segments */}
              <div className="relative">
                {/* Upper Arm */}
                <motion.div
                  className="w-4 h-20 bg-orange-500 rounded-full mx-auto origin-bottom shadow-lg"
                  animate={isAnimating && selectedObject ? {
                    rotateZ: [0, -35, -35, 0],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Forearm */}
                <motion.div
                  className="w-3 h-16 bg-orange-400 rounded-full mx-auto origin-top shadow-lg"
                  style={{ marginTop: '-2px' }}
                  animate={isAnimating && selectedObject ? {
                    rotateZ: [0, 45, 45, 0],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Gripper */}
                <motion.div
                  className="w-6 h-4 bg-gray-800 rounded mx-auto origin-top shadow-lg"
                  style={{ marginTop: '-2px' }}
                  animate={isAnimating && selectedObject ? {
                    scaleY: [1, 1.3, 0.7, 1.3, 1],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  {/* Gripper Fingers */}
                  <div className="flex justify-between px-1.5">
                    <motion.div 
                      className="w-1 h-3 bg-gray-600 rounded-full"
                      animate={isAnimating && selectedObject ? {
                        scaleY: [1, 1.5, 0.8, 1.5, 1],
                      } : {}}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="w-1 h-3 bg-gray-600 rounded-full"
                      animate={isAnimating && selectedObject ? {
                        scaleY: [1, 1.5, 0.8, 1.5, 1],
                      } : {}}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Robotic Arm - Placer */}
            <motion.div
              className="relative"
              animate={isAnimating && targetLocation ? {
                y: [0, -20, 0],
              } : {}}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              {/* Base */}
              <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-3 shadow-lg"></div>
              
              {/* Arm Segments */}
              <div className="relative">
                {/* Upper Arm */}
                <motion.div
                  className="w-4 h-20 bg-orange-500 rounded-full mx-auto origin-bottom shadow-lg"
                  animate={isAnimating && targetLocation ? {
                    rotateZ: [0, 35, 35, 0],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Forearm */}
                <motion.div
                  className="w-3 h-16 bg-orange-400 rounded-full mx-auto origin-top shadow-lg"
                  style={{ marginTop: '-2px' }}
                  animate={isAnimating && targetLocation ? {
                    rotateZ: [0, -45, -45, 0],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Gripper */}
                <motion.div
                  className="w-6 h-4 bg-gray-800 rounded mx-auto origin-top shadow-lg"
                  style={{ marginTop: '-2px' }}
                  animate={isAnimating && targetLocation ? {
                    scaleY: [1, 0.7, 1.3, 0.7, 1],
                  } : {}}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  {/* Gripper Fingers */}
                  <div className="flex justify-between px-1.5">
                    <motion.div 
                      className="w-1 h-3 bg-gray-600 rounded-full"
                      animate={isAnimating && targetLocation ? {
                        scaleY: [1, 0.8, 1.2, 0.8, 1],
                      } : {}}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="w-1 h-3 bg-gray-600 rounded-full"
                      animate={isAnimating && targetLocation ? {
                        scaleY: [1, 0.8, 1.2, 0.8, 1],
                      } : {}}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
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
                  scale: [1, 1.3, 1.1],
                  y: [0, -80, -60],
                  rotate: [0, 180, 360],
                  x: [0, -20, 0],
                } : {}}
                transition={{ 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
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

        {/* Robotic Arm Movement Path */}
        {isAnimating && selectedObject && targetLocation && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {/* Pick-up path (curved) */}
            <motion.path
              d={`M ${getLocationCoords(selectedObject.location)?.x || 0} ${getLocationCoords(selectedObject.location)?.y || 0} Q ${(getLocationCoords(selectedObject.location)?.x || 0) + 50} ${(getLocationCoords(selectedObject.location)?.y || 0) - 100} ${getLocationCoords(selectedObject.location)?.x || 0} ${(getLocationCoords(selectedObject.location)?.y || 0) - 80}`}
              stroke="url(#pickupGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8,4"
              animate={{
                strokeDashoffset: [0, -12],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Placement path (straight) */}
            <motion.path
              d={`M ${getLocationCoords(selectedObject.location)?.x || 0} ${(getLocationCoords(selectedObject.location)?.y || 0) - 80} L ${targetLocation.x} ${targetLocation.y}`}
              stroke="url(#placementGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8,4"
              animate={{
                strokeDashoffset: [0, -12],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <defs>
              <linearGradient id="pickupGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
              <linearGradient id="placementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
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