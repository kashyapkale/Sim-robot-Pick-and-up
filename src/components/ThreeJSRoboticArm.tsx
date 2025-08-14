'use client';

import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { Location, GameObject } from '@/types/game';

interface ThreeJSRoboticArmProps {
  gameObjects: GameObject[];
  locations: Location[];
  selectedObject: GameObject | null;
  targetLocation: Location | null;
  isAnimating: boolean;
}

export default function ThreeJSRoboticArm({
  gameObjects,
  locations,
  selectedObject,
  targetLocation,
  isAnimating,
}: ThreeJSRoboticArmProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Store location positions to avoid recalculating with random values
  const locationPositionsRef = useRef<Map<string, { x: number, z: number }>>(new Map());
  const sceneRef = useRef<any>(null);
  const humanRef = useRef<any>(null);
  const objectMeshesRef = useRef<any[]>([]);
  
  // Animation state refs - persist across renders
  const animationStateRef = useRef<{
    startTime: number;
    progress: number;
    startPos: { x: number, z: number };
    objectPos: { x: number, z: number };
    targetPos: { x: number, z: number };
    objectMesh: any;
    isActive: boolean;
  } | null>(null);

  useEffect(() => {
    console.log('🔍 ThreeJSRoboticArm useEffect triggered');
    console.log('🔍 [PROPS_FROM_PAGE] Props received from page.tsx:', {
      gameObjects: {
        count: gameObjects?.length || 0,
        data: gameObjects,
        firstObject: gameObjects?.[0],
        firstObjectKeys: gameObjects?.[0] ? Object.keys(gameObjects[0]) : null
      },
      locations: {
        count: locations?.length || 0,
        data: locations,
        firstLocation: locations?.[0],
        firstLocationKeys: locations?.[0] ? Object.keys(locations[0]) : null
      },
      selectedObject: {
        value: selectedObject,
        type: typeof selectedObject,
        keys: selectedObject ? Object.keys(selectedObject) : null,
        isNull: selectedObject === null
      },
      targetLocation: {
        value: targetLocation,
        type: typeof targetLocation,
        keys: targetLocation ? Object.keys(targetLocation) : null,
        isNull: targetLocation === null
      },
      isAnimating: {
        value: isAnimating,
        type: typeof isAnimating
      }
    });
    
    if (!mountRef.current) {
      console.log('❌ No mount ref available');
      return;
    }

    if (isLoaded) {
      console.log('✅ Already loaded, skipping scene creation');
      return;
    }

    const loadThreeJS = async () => {
      try {
        console.log('🚀 Starting Three.js load...');
        setDebugInfo('Loading Three.js...');
        
        const THREE = await import('three');
        console.log('✅ Three.js loaded successfully');
        setDebugInfo('Three.js loaded, creating scene...');
        
        // Create garden scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 20, 80);
        sceneRef.current = scene;
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        camera.position.set(8, 8, 12);
        camera.lookAt(0, 2, 0);
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(800, 600);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        
        mountRef.current!.appendChild(renderer.domElement);
        setDebugInfo('Scene created, adding elements...');
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
        sunLight.position.set(15, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);
        
        const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
        fillLight.position.set(-10, 15, -10);
        scene.add(fillLight);
        
        const accentLight = new THREE.PointLight(0xffd700, 0.4, 15);
        accentLight.position.set(0, 8, 0);
        scene.add(accentLight);
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(40, 40, 40, 40);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x2d5a27,
          roughness: 0.9,
          metalness: 0.0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Calculate and store fixed location positions
        locationPositionsRef.current.clear();
        locations.forEach((location, index) => {
          const angle = (index / locations.length) * Math.PI * 2;
          const radius = 6 + (index % 3) * 2; // Deterministic radius
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          locationPositionsRef.current.set(location.id, { x, z });
          console.log(`📍 Location ${location.id} fixed at (${x.toFixed(2)}, ${z.toFixed(2)})`);
        });
        
        // Add location markers
        const markerMeshes: THREE.Mesh[] = [];
        locations.forEach((location) => {
          const pos = locationPositionsRef.current.get(location.id)!;
          
          // Stone marker
          const stoneGeometry = new THREE.CylinderGeometry(0.6, 0.7, 0.15, 8);
          const stoneMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.8,
            metalness: 0.1
          });
          const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
          stone.position.set(pos.x, 0.075, pos.z);
          stone.receiveShadow = true;
          stone.castShadow = true;
          scene.add(stone);
          markerMeshes.push(stone);
          
          // Location label
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = 64;
            canvas.height = 64;
            context.fillStyle = '#ffffff';
            context.font = 'bold 32px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(location.id, 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.MeshBasicMaterial({ 
              map: texture,
              transparent: true
            });
            
            const labelGeometry = new THREE.PlaneGeometry(0.8, 0.8);
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.set(pos.x, 0.4, pos.z);
            label.rotation.x = -Math.PI / 2;
            scene.add(label);
          }
        });
        
        // Add game objects
        objectMeshesRef.current = [];
        if (gameObjects && gameObjects.length > 0) {
          console.log('🔍 [MESH_CREATION] Creating meshes for game objects:', gameObjects);
          
          gameObjects.forEach((obj, index) => {
            const locationPos = locationPositionsRef.current.get(obj.location);
            if (!locationPos) return;
            
            let geometry: THREE.BufferGeometry;
            let material: THREE.Material;
            
            switch (obj.type) {
              case 'brick':
                geometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
                material = new THREE.MeshStandardMaterial({ 
                  color: 0xcc4400,
                  roughness: 0.8
                });
                break;
              case 'chair':
                geometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
                material = new THREE.MeshStandardMaterial({ 
                  color: 0x8B4513,
                  roughness: 0.7
                });
                break;
              case 'table':
                geometry = new THREE.BoxGeometry(1.2, 0.1, 0.8);
                material = new THREE.MeshStandardMaterial({ 
                  color: 0x654321,
                  roughness: 0.3
                });
                break;
              case 'book':
                geometry = new THREE.BoxGeometry(0.3, 0.4, 0.2);
                material = new THREE.MeshStandardMaterial({ 
                  color: 0x2E8B57,
                  roughness: 0.9
                });
                break;
              default:
                geometry = new THREE.SphereGeometry(0.3, 16, 12);
                material = new THREE.MeshStandardMaterial({ 
                  color: 0x888888,
                  roughness: 0.5
                });
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(locationPos.x, 0.5, locationPos.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { gameObjectId: obj.id }; // Store ID for lookup
            scene.add(mesh);
            objectMeshesRef.current.push(mesh);
            
            console.log(`🔍 [MESH_CREATION] Mesh ${index} created:`, {
              meshIndex: index,
              objectName: obj.name,
              objectId: obj.id,
              objectIdType: typeof obj.id,
              meshUserData: mesh.userData,
              meshUserDataGameObjectId: mesh.userData.gameObjectId,
              meshUserDataGameObjectIdType: typeof mesh.userData.gameObjectId,
              location: obj.location,
              position: { x: locationPos.x, z: locationPos.z }
            });
          });
          
          console.log('🔍 [MESH_CREATION] Final objectMeshesRef array:', objectMeshesRef.current.map((mesh, index) => ({
            meshIndex: index,
            userData: mesh.userData,
            gameObjectId: mesh.userData.gameObjectId,
            gameObjectIdType: typeof mesh.userData.gameObjectId
          })));
        }
        
        // Create human character
        const createHuman = () => {
          const humanGroup = new THREE.Group();
          
          // Head
          const headGeometry = new THREE.SphereGeometry(0.25, 8, 6);
          const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xfdbcb4,
            roughness: 0.8
          });
          const head = new THREE.Mesh(headGeometry, headMaterial);
          head.position.y = 1.7;
          head.castShadow = true;
          humanGroup.add(head);
          
          // Body
          const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.3);
          const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3498db,
            roughness: 0.7
          });
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.y = 1.2;
          body.castShadow = true;
          humanGroup.add(body);
          
          // Arms
          const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
          const armMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xfdbcb4,
            roughness: 0.8
          });
          
          const leftArm = new THREE.Mesh(armGeometry, armMaterial);
          leftArm.position.set(-0.4, 1.2, 0);
          leftArm.rotation.z = Math.PI / 2;
          leftArm.castShadow = true;
          leftArm.name = 'leftArm';
          humanGroup.add(leftArm);
          
          const rightArm = new THREE.Mesh(armGeometry, armMaterial);
          rightArm.position.set(0.4, 1.2, 0);
          rightArm.rotation.z = -Math.PI / 2;
          rightArm.castShadow = true;
          rightArm.name = 'rightArm';
          humanGroup.add(rightArm);
          
          // Legs
          const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6);
          const legMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2c3e50,
            roughness: 0.8
          });
          
          const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
          leftLeg.position.set(-0.15, 0.4, 0);
          leftLeg.castShadow = true;
          humanGroup.add(leftLeg);
          
          const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
          rightLeg.position.set(0.15, 0.4, 0);
          rightLeg.castShadow = true;
          humanGroup.add(rightLeg);
          
          humanGroup.position.set(0, 0, 0);
          return humanGroup;
        };
        
        const human = createHuman();
        scene.add(human);
        humanRef.current = human;
        console.log('✅ Human character added');
        setDebugInfo('Scene ready, animation running...');
        
        // Animation loop
        let animationId: number;
        
        const animate = () => {
          const now = Date.now();
          
          // Handle animation
          if (isAnimating && selectedObject && targetLocation && humanRef.current) {
            // Debug logging only when animation starts
            if (!animationStateRef.current || !animationStateRef.current.isActive) {
              console.log('🔍 [ANIMATION_CONDITIONS] Animation conditions met:', {
                isAnimating,
                selectedObjectType: typeof selectedObject,
                selectedObjectValue: selectedObject,
                targetLocationType: typeof targetLocation,
                targetLocationValue: targetLocation,
                humanRefCurrent: !!humanRef.current
              });
            }
            
            // Initialize animation if needed
            if (!animationStateRef.current || !animationStateRef.current.isActive) {
              console.log('🔍 [ANIMATION_LOOKUP] Starting object lookup for animation');
              console.log('🔍 [ANIMATION_LOOKUP] selectedObject details:', {
                selectedObjectId: selectedObject.id,
                selectedObjectIdType: typeof selectedObject.id,
                selectedObjectName: selectedObject.name,
                selectedObjectType: selectedObject.type,
                selectedObjectLocation: selectedObject.location,
                fullSelectedObject: selectedObject
              });
              
              const objectPos = locationPositionsRef.current.get(selectedObject.location);
              const targetPos = locationPositionsRef.current.get(targetLocation.id);
              
              console.log('🔍 [ANIMATION_LOOKUP] Available meshes for lookup:', objectMeshesRef.current.map((mesh, index) => ({
                meshIndex: index,
                meshUserData: mesh.userData,
                meshGameObjectId: mesh.userData.gameObjectId,
                meshGameObjectIdType: typeof mesh.userData.gameObjectId,
                comparison: `mesh.userData.gameObjectId (${mesh.userData.gameObjectId}) === selectedObject.id (${selectedObject.id}) = ${mesh.userData.gameObjectId === selectedObject.id}`
              })));
              
              const objectMesh = objectMeshesRef.current.find(mesh => 
                mesh.userData.gameObjectId === selectedObject.id
              );
              
              console.log('🔍 [ANIMATION_LOOKUP] Lookup result:', {
                objectMeshFound: !!objectMesh,
                objectMesh: objectMesh,
                objectPos: objectPos,
                targetPos: targetPos,
                lookupSuccess: !!(objectPos && targetPos && objectMesh)
              });
              
              if (objectPos && targetPos && objectMesh) {
                animationStateRef.current = {
                  startPos: { x: humanRef.current.position.x, z: humanRef.current.position.z },
                  objectPos,
                  targetPos,
                  objectMesh,
                  startTime: now,
                  progress: 0,
                  isActive: true
                };
                console.log('🎬 Animation initialized:', {
                  from: animationStateRef.current.startPos,
                  to: objectPos,
                  then: targetPos,
                  object: selectedObject.name
                });
              }
            }
            
            // Update animation progress
            if (animationStateRef.current && animationStateRef.current.isActive) {
              const state = animationStateRef.current;
              const duration = 4000; // 4 seconds total
              state.progress = Math.min((now - state.startTime) / duration, 1);
              
              console.log(`🎯 Animation Progress: ${(state.progress * 100).toFixed(1)}%`);
              
              // Animation phases
              if (state.progress < 0.25) {
                // Phase 1: Walk to object
                const phase = state.progress / 0.25;
                humanRef.current.position.x = state.startPos.x + (state.objectPos.x - state.startPos.x) * phase;
                humanRef.current.position.z = state.startPos.z + (state.objectPos.z - state.startPos.z) * phase;
                humanRef.current.position.y = Math.abs(Math.sin(now * 0.008)) * 0.05;
                
                // Face direction
                const lookAtX = state.objectPos.x;
                const lookAtZ = state.objectPos.z;
                const angle = Math.atan2(lookAtZ - humanRef.current.position.z, lookAtX - humanRef.current.position.x);
                humanRef.current.rotation.y = angle - Math.PI / 2;
                
                console.log(`Phase 1: Walking to object (${(phase * 100).toFixed(1)}%)`);
                
              } else if (state.progress < 0.5) {
                // Phase 2: Pick up
                const phase = (state.progress - 0.25) / 0.25;
                humanRef.current.position.x = state.objectPos.x;
                humanRef.current.position.z = state.objectPos.z;
                humanRef.current.rotation.x = phase * 0.3;
                
                // Move object up
                state.objectMesh.position.y = 0.5 + phase * 1;
                
                console.log(`Phase 2: Picking up (${(phase * 100).toFixed(1)}%)`);
                
              } else if (state.progress < 0.75) {
                // Phase 3: Walk to target
                const phase = (state.progress - 0.5) / 0.25;
                humanRef.current.position.x = state.objectPos.x + (state.targetPos.x - state.objectPos.x) * phase;
                humanRef.current.position.z = state.objectPos.z + (state.targetPos.z - state.objectPos.z) * phase;
                humanRef.current.position.y = Math.abs(Math.sin(now * 0.008)) * 0.05;
                humanRef.current.rotation.x = 0;
                
                // Face direction
                const angle = Math.atan2(
                  state.targetPos.z - state.objectPos.z,
                  state.targetPos.x - state.objectPos.x
                );
                humanRef.current.rotation.y = angle - Math.PI / 2;
                
                // Object follows human
                state.objectMesh.position.x = humanRef.current.position.x;
                state.objectMesh.position.z = humanRef.current.position.z;
                state.objectMesh.position.y = 1.5;
                
                console.log(`Phase 3: Carrying to target (${(phase * 100).toFixed(1)}%)`);
                
              } else {
                // Phase 4: Place down
                const phase = (state.progress - 0.75) / 0.25;
                humanRef.current.position.x = state.targetPos.x;
                humanRef.current.position.z = state.targetPos.z;
                humanRef.current.rotation.x = (1 - phase) * 0.3;
                
                // Lower object
                state.objectMesh.position.x = state.targetPos.x;
                state.objectMesh.position.z = state.targetPos.z;
                state.objectMesh.position.y = 1.5 - phase * 1;
                
                console.log(`Phase 4: Placing down (${(phase * 100).toFixed(1)}%)`);
                
                // Animation complete
                if (state.progress >= 1) {
                  console.log('✅ Animation complete!');
                  animationStateRef.current.isActive = false;
                }
              }
            }
          } else if (humanRef.current) {
            // Reset animation state when not animating
            if (animationStateRef.current && animationStateRef.current.isActive) {
              animationStateRef.current.isActive = false;
              humanRef.current.position.set(0, 0, 0);
              humanRef.current.rotation.set(0, 0, 0);
            }
            
            // Idle animation
            humanRef.current.position.y = Math.sin(now * 0.001) * 0.01;
            
            // Get arms for idle sway
            const leftArm = humanRef.current.children.find((child: any) => child.name === 'leftArm');
            const rightArm = humanRef.current.children.find((child: any) => child.name === 'rightArm');
            if (leftArm && rightArm) {
              leftArm.rotation.z = Math.PI / 2 + Math.sin(now * 0.0005) * 0.05;
              rightArm.rotation.z = -Math.PI / 2 - Math.sin(now * 0.0005) * 0.05;
            }
          }
          
          renderer.render(scene, camera);
          animationId = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('✅ Animation loop started');
        setIsLoaded(true);
        
        // Cleanup
        return () => {
          console.log('🧹 Cleaning up Three.js scene');
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };
        
      } catch (error) {
        console.error('❌ Failed to load Three.js:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    loadThreeJS();
  }, [isLoaded]); // Only depend on isLoaded for scene creation
  
  // Separate effect for animation state changes
  useEffect(() => {
    console.log('🎬 [ANIMATION_STATE_CHANGE] Animation state changed:', {
      isAnimating,
      selectedObject,
      selectedObjectType: typeof selectedObject,
      selectedObjectKeys: selectedObject ? Object.keys(selectedObject) : null,
      targetLocation,
      targetLocationType: typeof targetLocation,
      targetLocationKeys: targetLocation ? Object.keys(targetLocation) : null
    });
  }, [isAnimating, selectedObject, targetLocation]);

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-6">
          <span className="mr-3">🤖</span> 3D Scene Error
        </h2>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <span className="mr-3">🤖</span> 3D Garden Simulation
      </h2>
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
        <div className="text-sm text-blue-300 mb-2">
          <span className="font-semibold">Status:</span> {debugInfo}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-300">
              <strong>Animation:</strong> {isAnimating ? '🎬 Running' : '⏸️ Ready'}
            </div>
            <div className="text-gray-300">
              <strong>Selected:</strong> {selectedObject?.name || 'None'}
            </div>
            <div className="text-gray-300">
              <strong>Target:</strong> {targetLocation?.id || 'None'}
            </div>
          </div>
          <div>
            <div className="text-gray-300">
              <strong>Objects:</strong> {gameObjects?.length || 0}
            </div>
            <div className="text-gray-300">
              <strong>Locations:</strong> {locations?.length || 0}
            </div>
          </div>
        </div>
      </div>
      <div 
        ref={mountRef} 
        className="w-full h-[600px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border-2 border-gray-600/50 overflow-hidden"
      />
    </div>
  );
}