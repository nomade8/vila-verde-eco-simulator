
import React, { useRef, useEffect, useCallback } from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, PlaneGeometry, AmbientLight, DirectionalLight, Raycaster, Vector2, Object3D, Color, CylinderGeometry, MeshStandardMaterial, Group, ConeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlacedBuilding, BuildingType, IndicatorLevels, Vector3 as GameVector3 } from '../types';
import { CELL_SIZE, GRID_SIZE, INITIAL_TERRAIN_SIZE } from '../constants';

interface ThreeSceneProps {
  placedBuildings: PlacedBuilding[];
  onPlaceBuilding: (position: GameVector3, type: BuildingType) => void;
  // onSelectBuildingForInfo: (building: PlacedBuilding) => void; // Prop removida
  selectedBuildingTypeForPlacement: BuildingType | null;
  indicators: IndicatorLevels;
  unlockedTerrainAreas: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({
  placedBuildings,
  onPlaceBuilding,
  // onSelectBuildingForInfo, // Prop removida
  selectedBuildingTypeForPlacement,
  indicators,
  unlockedTerrainAreas
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groundPlaneRef = useRef<Mesh | null>(null);
  const waterPlaneRef = useRef<Mesh | null>(null);
  const buildingGroupRef = useRef<Group | null>(null);

  const getBuildingColor = useCallback((type: BuildingType): Color => {
    switch (type) {
      case BuildingType.SUSTAINABLE_HOUSE: return new Color(0x90caf9); // Light Blue for body
      case BuildingType.COMMUNITY_GARDEN: return new Color(0x4CAF50); // Vivid Green
      case BuildingType.SOLAR_PANEL_ARRAY: return new Color(0xffcc80); // Light Orange
      case BuildingType.WATER_TREATMENT: return new Color(0x80deea); // Light Cyan
      case BuildingType.WASTE_COLLECTION: return new Color(0xce93d8); // Light Purple
      case BuildingType.REFORESTATION_AREA: return new Color(0x66bb6a); // Medium Green
      case BuildingType.COMMUNITY_CENTER: return new Color(0xffab91); // Light Red/Orange
      case BuildingType.SCHOOL: return new Color(0x4169E1); // Royal Blue
      case BuildingType.HEALTH_POST: return new Color(0xffffff); // White
      default: return new Color(0xeeeeee); // Light Grey
    }
  }, []);
  
  const createBuildingMesh = useCallback((building: PlacedBuilding): Mesh | Group => {
    let geometry;
    // Default material, can be overridden
    let material = new MeshStandardMaterial({ color: getBuildingColor(building.type), flatShading: false, roughness: 0.7, metalness: 0.2 });
    
    switch (building.type) {
        case BuildingType.SUSTAINABLE_HOUSE:
            const sustainableHouseGroup = new Group();

            const bodyHeight = CELL_SIZE * 0.8;
            const bodyWidth = CELL_SIZE * 0.8;
            const bodyDepth = CELL_SIZE * 0.8;

            const houseBodyMat = new MeshStandardMaterial({ color: getBuildingColor(building.type), flatShading: false, roughness: 0.7, metalness: 0.2 });
            const houseBodyGeo = new BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
            const houseBodyMesh = new Mesh(houseBodyGeo, houseBodyMat);
            houseBodyMesh.position.y = bodyHeight / 2; // Center of the body, so base is at group's y=0
            houseBodyMesh.castShadow = true;
            houseBodyMesh.receiveShadow = true;
            sustainableHouseGroup.add(houseBodyMesh);

            const roofHeight = CELL_SIZE * 0.6; // Y-axis size maintained
            const roofRadius = bodyWidth * 1.15; // X and Z axes size doubled ( (bodyWidth / 2) * 1.15 * 2 )
            const roofMat = new MeshStandardMaterial({ color: 0xf08080, flatShading: false, roughness: 0.7, metalness: 0.2 }); // LightCoral (Light Red)
            const roofGeo = new ConeGeometry(roofRadius, roofHeight, 4); // Radius, Height, 4 Segments for pyramid
            const roofMesh = new Mesh(roofGeo, roofMat);
            roofMesh.position.y = bodyHeight; // Base of the cone sits on top of the house body
            roofMesh.rotation.y = Math.PI / 4; // Align flat sides of pyramid with house walls
            roofMesh.castShadow = true;
            roofMesh.receiveShadow = true;
            sustainableHouseGroup.add(roofMesh);

            sustainableHouseGroup.position.set(building.position.x, building.position.y, building.position.z);
            sustainableHouseGroup.userData = { buildingId: building.id, type: building.type };
            // sustainableHouseGroup.castShadow = true; // Not needed on group if children cast
            // sustainableHouseGroup.receiveShadow = true; // Not needed on group if children receive
            return sustainableHouseGroup;

        case BuildingType.COMMUNITY_GARDEN:
            geometry = new BoxGeometry(CELL_SIZE * 1.5, CELL_SIZE * 0.3, CELL_SIZE * 1.5);
            break;
        case BuildingType.SOLAR_PANEL_ARRAY:
            geometry = new BoxGeometry(CELL_SIZE * 2, CELL_SIZE * 0.2, CELL_SIZE * 1);
            break;
        case BuildingType.WATER_TREATMENT:
            geometry = new CylinderGeometry(CELL_SIZE * 0.6, CELL_SIZE*0.6, CELL_SIZE*1, 16);
            break;
        case BuildingType.SCHOOL:
            geometry = new BoxGeometry(CELL_SIZE * 1.2, CELL_SIZE * 0.8, CELL_SIZE * 1.5); // Slightly larger, rectangular
            break;
        case BuildingType.HEALTH_POST:
            geometry = new BoxGeometry(CELL_SIZE * 1.0, CELL_SIZE * 0.7, CELL_SIZE * 1.0); // Clean, smaller box
            break;
        case BuildingType.REFORESTATION_AREA: 
            const reforestGroup = new Group();
            const trunkMat = new MeshStandardMaterial({color: 0x8B4513}); // Brown
            const foliageMat = new MeshStandardMaterial({color: 0x2E8B57}); // SeaGreen
            for(let i=0; i<3; i++) {
                const trunk = new Mesh(new CylinderGeometry(CELL_SIZE*0.1, CELL_SIZE*0.1, CELL_SIZE*0.5, 8), trunkMat);
                const foliage = new Mesh(new ConeGeometry(CELL_SIZE*0.3, CELL_SIZE*0.6, 8), foliageMat); // Cone
                foliage.position.y = CELL_SIZE*0.55 / 2 + CELL_SIZE*0.5 /2 ; // Place base of foliage at top of trunk
                const tree = new Group();
                trunk.position.y = CELL_SIZE*0.5 / 2; // Center trunk
                tree.add(trunk);
                tree.add(foliage);
                tree.position.set(
                    (Math.random() - 0.5) * CELL_SIZE * 0.7,
                    0, // Tree base will be at group y + this
                    (Math.random() - 0.5) * CELL_SIZE * 0.7
                );
                tree.castShadow = true;
                reforestGroup.add(tree);
            }
            // Invisible base for interaction, or a very low green patch
            const baseGeometry = new BoxGeometry(CELL_SIZE * 1.8, CELL_SIZE * 0.1, CELL_SIZE * 1.8);
            const baseMesh = new Mesh(baseGeometry, new MeshBasicMaterial({ visible: false })); // Keep invisible for now
            reforestGroup.add(baseMesh); // Add base so group has a main geometry for raycasting if needed
            
            reforestGroup.userData = { buildingId: building.id, type: building.type }; 
            reforestGroup.position.set(building.position.x, building.position.y + CELL_SIZE * 0.05, building.position.z); // Slightly raise the area
            return reforestGroup;
        default:
            geometry = new BoxGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9, CELL_SIZE * 0.9);
    }

    const mesh = new Mesh(geometry, material);
    mesh.position.set(building.position.x, building.position.y + (geometry.parameters.height || (CELL_SIZE * 0.9))/ 2, building.position.z);
    mesh.userData = { buildingId: building.id, type: building.type }; 
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, [getBuildingColor]);


  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    sceneRef.current = new Scene();
    sceneRef.current.background = new Color(0x87ceeb); // Sky Blue

    cameraRef.current = new PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    cameraRef.current.position.set(GRID_SIZE * CELL_SIZE / 4, GRID_SIZE * CELL_SIZE / 3, GRID_SIZE * CELL_SIZE / 4);
    cameraRef.current.lookAt(0, 0, 0);

    rendererRef.current = new WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current.shadowMap.enabled = true;
    currentMount.appendChild(rendererRef.current.domElement);
    
    buildingGroupRef.current = new Group();
    sceneRef.current.add(buildingGroupRef.current);

    const groundGeometry = new PlaneGeometry(GRID_SIZE * CELL_SIZE * 2, GRID_SIZE * CELL_SIZE * 2); 
    const groundMaterial = new MeshStandardMaterial({ color: 0x9ccc65, roughness: 1, metalness: 0 }); 
    groundPlaneRef.current = new Mesh(groundGeometry, groundMaterial);
    groundPlaneRef.current.rotation.x = -Math.PI / 2;
    groundPlaneRef.current.receiveShadow = true;
    sceneRef.current.add(groundPlaneRef.current);
    
    const waterGeometry = new PlaneGeometry(GRID_SIZE * CELL_SIZE * 0.3, GRID_SIZE * CELL_SIZE * 2);
    const waterMaterial = new MeshStandardMaterial({ color: new Color(0x60A5FA), transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.1 });
    waterPlaneRef.current = new Mesh(waterGeometry, waterMaterial);
    waterPlaneRef.current.rotation.x = -Math.PI / 2;
    waterPlaneRef.current.position.set(-INITIAL_TERRAIN_SIZE * CELL_SIZE * 0.6, 0.05, 0); 
    waterPlaneRef.current.receiveShadow = true;
    sceneRef.current.add(waterPlaneRef.current);

    const ambientLight = new AmbientLight(0xffffff, 0.7);
    sceneRef.current.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -GRID_SIZE * CELL_SIZE / 2;
    directionalLight.shadow.camera.right = GRID_SIZE * CELL_SIZE / 2;
    directionalLight.shadow.camera.top = GRID_SIZE * CELL_SIZE / 2;
    directionalLight.shadow.camera.bottom = -GRID_SIZE * CELL_SIZE / 2;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    sceneRef.current.add(directionalLight);

    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.maxPolarAngle = Math.PI / 2.1; 

    const animate = () => {
      requestAnimationFrame(animate);
      controlsRef.current?.update();
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && currentMount) {
         currentMount.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

   useEffect(() => {
    if (!sceneRef.current || !buildingGroupRef.current) return;

    while(buildingGroupRef.current.children.length > 0){ 
        const obj = buildingGroupRef.current.children[0];
        buildingGroupRef.current.remove(obj);
        if (obj instanceof Mesh || obj instanceof Group) { 
             obj.traverse((child: Object3D) => { 
                if (child instanceof Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }

    placedBuildings.forEach(building => {
      const meshOrGroup = createBuildingMesh(building);
      building.meshUuid = meshOrGroup.uuid; 
      buildingGroupRef.current!.add(meshOrGroup);
    });
  }, [placedBuildings, createBuildingMesh]);


  useEffect(() => {
    if (sceneRef.current?.background instanceof Color && waterPlaneRef.current?.material instanceof MeshStandardMaterial) {
      const airQualityFactor = indicators.airQuality / 100; 
      const skyColor = new Color(0x87ceeb).lerp(new Color(0xb0b0b0), 1 - airQualityFactor); 
      sceneRef.current.background = skyColor;

      const waterQualityFactor = indicators.waterQuality / 100; 
      const waterC = new Color(0x1e90ff).lerp(new Color(0x556b2f), 1 - waterQualityFactor); 
      (waterPlaneRef.current.material as MeshStandardMaterial).color.set(waterC);
      (waterPlaneRef.current.material as MeshStandardMaterial).opacity = 0.6 + waterQualityFactor * 0.3;
    }
  }, [indicators]);

  useEffect(() => {
    // Logic related to unlockedTerrainAreas can be added here if it needs to affect the 3D scene directly
    // For example, expanding the visible ground plane or adding visual cues for new areas.
    // Currently, terrain expansion limit is checked in handleCanvasClick.
  }, [unlockedTerrainAreas]);


  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current || !rendererRef.current || !buildingGroupRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Check for building click first
    const buildingIntersects = raycaster.intersectObjects(buildingGroupRef.current.children, true); 
    if (buildingIntersects.length > 0) {
        let clickedObject: Object3D | null = buildingIntersects[0].object;
        
        // Traverse up to find the group that has userData.buildingId (the main building group)
        while(clickedObject && clickedObject.parent && clickedObject.parent !== buildingGroupRef.current && !clickedObject.userData.buildingId) {
            clickedObject = clickedObject.parent;
        }

        if (clickedObject && clickedObject.userData.buildingId) {
            // const buildingId = clickedObject.userData.buildingId;
            // const foundBuilding = placedBuildings.find(b => b.id === buildingId);
            // if (foundBuilding) {
            // //   onSelectBuildingForInfo(foundBuilding); // Chamada removida
            // }
            console.log("Building clicked, ID:", clickedObject.userData.buildingId); // Log for now
            return; // Prevent placing a new building if an existing one is clicked.
        }
    }
    
    if (!selectedBuildingTypeForPlacement) return; // Only proceed if in placement mode

    if (groundPlaneRef.current) {
        const groundIntersects = raycaster.intersectObject(groundPlaneRef.current);
        if (groundIntersects.length > 0) {
            const intersectPoint = groundIntersects[0].point;
            // Snap to grid
            const x = Math.round(intersectPoint.x / CELL_SIZE) * CELL_SIZE;
            const z = Math.round(intersectPoint.z / CELL_SIZE) * CELL_SIZE;
            
            // Check terrain boundaries based on unlocked areas
            const currentTerrainLimit = (INITIAL_TERRAIN_SIZE / 2 + unlockedTerrainAreas) * CELL_SIZE;

            if (Math.abs(x) < currentTerrainLimit && Math.abs(z) < currentTerrainLimit) { 
                // Check if cell is occupied
                const isOccupied = placedBuildings.some(b => b.position.x === x && b.position.z === z);
                if (!isOccupied) {
                    onPlaceBuilding({ x, y: 0, z }, selectedBuildingTypeForPlacement); // y is 0 for ground placement
                } else {
                    console.log("Cell is occupied!"); // User feedback (can be improved with UI notification)
                }
            } else {
                console.log("Cannot build outside unlocked terrain!"); // User feedback
            }
        }
    }
  }, [cameraRef, sceneRef, rendererRef, selectedBuildingTypeForPlacement, onPlaceBuilding, /* onSelectBuildingForInfo removida */ placedBuildings, unlockedTerrainAreas]);

  return <div ref={mountRef} className="flex-grow w-full h-full" onClick={handleCanvasClick} />;
};

export default ThreeScene;
