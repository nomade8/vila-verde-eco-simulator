
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ThreeScene from './components/ThreeScene';
import { BuildingType, PlacedBuilding, IndicatorLevels, GameState, Challenge, Vector3 as GameVector3, HistoricDataPoint } from './types';
import { BUILDING_DEFINITIONS, INITIAL_INDICATORS, INITIAL_AVAILABLE_BUILDINGS, MAX_INDICATOR_VALUE, MIN_INDICATOR_VALUE, TERRAIN_UNLOCK_THRESHOLD, POPULATION_PER_HOUSE, INDICATOR_PEDAGOGICAL_INFO } from './constants';

// Helper icons (simple SVGs)
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm6.071-11.929a1 1 0 01.002 1.412l-.707.707a1 1 0 01-1.412-.002l-.707-.707a1 1 0 011.412-1.412l.707.707a1 1 0 01.002.002zM3.636 6.364a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.728 7.272a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-12.02.707a1 1 0 01-.002-1.412l.707-.707a1 1 0 011.412.002l.707.707a1 1 0 01-1.412 1.412l-.707-.707a1 1 0 01-.002-.002zM10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" /></svg>;
const WaterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 6a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 5a1 1 0 100 2h2a1 1 0 100-2H8z" clipRule="evenodd" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 4.707a1 1 0 00-1.414 0L12 8.586l-2.293-2.293a1 1 0 00-1.414 1.414L10.586 10l-2.293 2.293a1 1 0 101.414 1.414L12 11.414l2.293 2.293a1 1 0 001.414-1.414L13.414 10l2.293-2.293a1 1 0 000-1.414zM10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>;
const BoltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>;
const FoodIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v2H5V5zm0 4h10v2H5V9zm0 4h5v2H5v-2z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013-3c.29 0 .57.043.83.121zM12 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h14v2H2v-2zm12-4h4v10h-4V7zm-6-2h4v12H8V5zm-6 4h4v8H2V9z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;


const CHALLENGES_DEFINITION: Challenge[] = [
  {
    id: 'challenge1_energy',
    title: 'Energia para Todos!',
    description: 'A comunidade está crescendo e precisa de mais energia. Considere construir fontes de energia renovável.',
    goal: (gameState: GameState) => gameState.indicators.energyBalance > 10,
    reward: 'Novas opções de construção focadas em lazer foram desbloqueadas!',
  },
  {
    id: 'challenge2_clean_water',
    title: 'Água Pura, Vida Saudável!',
    description: 'A qualidade da água do rio precisa de atenção urgente devido ao aumento da população. Uma estação de tratamento é essencial.',
    goal: (gameState: GameState) => gameState.indicators.waterQuality > 70 && gameState.placedBuildings.some(b => b.type === BuildingType.WATER_TREATMENT),
    reward: 'A biodiversidade aquática aumentou! Pequenos peixes podem ser vistos no rio e a água está mais cristalina.',
  },
   {
    id: 'challenge3_happiness',
    title: 'Comunidade Feliz!',
    description: 'A felicidade da comunidade é essencial. Invista em espaços de convívio e lazer para todos.',
    goal: (gameState: GameState) => gameState.indicators.communityHappiness > 75 && gameState.placedBuildings.some(b => b.type === BuildingType.COMMUNITY_CENTER),
    reward: 'A Vila Verde se tornou um exemplo de bem-estar e coesão social!',
  },
  {
    id: 'challenge4_waste_management',
    title: 'Gestão de Resíduos Essencial!',
    description: 'A Vila Verde está crescendo! Para manter a limpeza e a saúde ambiental, é crucial construir um Centro de Coleta Seletiva.',
    goal: (gameState: GameState) => gameState.placedBuildings.some(b => b.type === BuildingType.WASTE_COLLECTION),
    reward: 'Coleta Seletiva implementada! O ar e a água da vila agradecem, e os cidadãos estão mais conscientes.',
  }
];


const IndicatorDisplay: React.FC<{
    label: string, 
    value: number, 
    icon: React.ReactNode, 
    unit?: string, 
    colorClass?: string,
    onClick?: () => void,
    showInfoIcon?: boolean
}> = ({label, value, icon, unit = '%', colorClass = 'text-green-600 dark:text-green-400', onClick, showInfoIcon}) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className={`flex items-center p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded shadow text-sm transition-all ${colorClass} ${onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700' : 'cursor-default'}`}
        aria-label={onClick ? `Saiba mais sobre ${label}` : label}
    >
      <span className="mr-1">{icon}</span>
      <span className="whitespace-nowrap">{label}: {value.toFixed(0)}{unit}</span>
      {showInfoIcon && onClick && <InfoIcon />}
    </button>
);

const getTrend = (current: number, previous?: number): string => {
  if (previous === undefined || current === previous) return '';
  return current > previous ? '▲' : '▼';
};

interface LineChartProps {
  title: string;
  data: { turn: number; value: number }[];
  width: number;
  height: number;
  lineColor: string;
  valueMin: number; 
  valueMax: number;
}

const LineChart: React.FC<LineChartProps> = ({ title, data, width, height, lineColor, valueMin, valueMax }) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height }} className="border border-gray-300 dark:border-gray-600 rounded p-2 flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-base">{title}</h4>
        <p>Dados insuficientes para exibir o gráfico.</p>
        <p>(Mínimo 2 turnos)</p>
      </div>
    );
  }

  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const turnMin = data[0].turn;
  const turnMax = data[data.length - 1].turn;
  
  const valueRange = valueMax - valueMin === 0 ? 1 : valueMax - valueMin; 
  const turnRange = turnMax - turnMin === 0 ? 1 : turnMax - turnMin;

  const points = data
    .map(d => {
      const x = margin.left + ((d.turn - turnMin) / turnRange) * chartWidth;
      const y = margin.top + chartHeight - (((d.value - valueMin) / valueRange) * chartHeight);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-2 shadow-sm bg-white dark:bg-gray-800">
      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-center text-base">{title}</h4>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label={title}>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="currentColor" className="text-gray-300 dark:text-gray-600" strokeWidth="1" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="currentColor" className="text-gray-300 dark:text-gray-600" strokeWidth="1" />
        <text x={margin.left - 5} y={margin.top + 5} textAnchor="end" className="text-sm fill-current text-gray-500 dark:text-gray-400">{valueMax.toFixed(0)}</text>
        <text x={margin.left - 5} y={height - margin.bottom} textAnchor="end" className="text-sm fill-current text-gray-500 dark:text-gray-400">{valueMin.toFixed(0)}</text>
        <text x={margin.left} y={height - margin.bottom + 15} textAnchor="start" className="text-sm fill-current text-gray-500 dark:text-gray-400">{turnMin}</text>
        <text x={width - margin.right} y={height - margin.bottom + 15} textAnchor="end" className="text-sm fill-current text-gray-500 dark:text-gray-400">{turnMax}</text>
        <text x={width / 2} y={height - margin.bottom + 15} textAnchor="middle" className="text-sm fill-current text-gray-500 dark:text-gray-400">Turno</text>
        <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" />
        {data.map((d, i) => {
            const x = margin.left + ((d.turn - turnMin) / turnRange) * chartWidth;
            const y = margin.top + chartHeight - (((d.value - valueMin) / valueRange) * chartHeight);
            return <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="2.5" fill={lineColor} />;
        })}
      </svg>
    </div>
  );
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    placedBuildings: [],
    indicators: INITIAL_INDICATORS,
    availableBuildings: INITIAL_AVAILABLE_BUILDINGS,
    selectedBuildingForInfo: null, 
    currentChallenge: null,
    unlockedTerrainAreas: 0,
    history: [{ turn: 0, indicators: INITIAL_INDICATORS }],
    currentTurn: 0,
    completedChallengeIds: [],
  });
  const [selectedBuildingTypeForPlacement, setSelectedBuildingTypeForPlacement] = useState<BuildingType | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showDashboard, setShowDashboard] = useState(false);
  const [infoForIndicatorKey, setInfoForIndicatorKey] = useState<keyof IndicatorLevels | null>(null);
  const [acknowledgedChallengeIdForTurn, setAcknowledgedChallengeIdForTurn] = useState<string | null>(null);


  useEffect(() => {
    const storedTheme = localStorage.getItem('vilaVerdeTheme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vilaVerdeTheme', theme);
  }, [theme]);

  const calculateIndicators = useCallback((buildings: PlacedBuilding[]): IndicatorLevels => {
    const newIndicators = { ...INITIAL_INDICATORS };
    newIndicators.energyBalance = 0;
    newIndicators.foodSupply = 20; 
    newIndicators.population = 0;

    buildings.forEach(building => {
      const def = BUILDING_DEFINITIONS[building.type];
      if (def.effects.airQuality) newIndicators.airQuality += def.effects.airQuality;
      if (def.effects.waterQuality) newIndicators.waterQuality += def.effects.waterQuality;
      if (def.effects.communityHappiness) newIndicators.communityHappiness += def.effects.communityHappiness;
      if (def.effects.biodiversity) newIndicators.biodiversity += def.effects.biodiversity;
      if (def.effects.energy) newIndicators.energyBalance += def.effects.energy;
      if (def.effects.food) newIndicators.foodSupply += def.effects.food;
      if (building.type === BuildingType.SUSTAINABLE_HOUSE) {
        newIndicators.population += POPULATION_PER_HOUSE;
      }
    });

    Object.keys(newIndicators).forEach(key => {
      const k = key as keyof IndicatorLevels;
      if (k !== 'energyBalance' && k !== 'population') {
         newIndicators[k] = Math.max(MIN_INDICATOR_VALUE, Math.min(MAX_INDICATOR_VALUE, newIndicators[k]));
      } else if (k === 'energyBalance') {
        newIndicators[k] = Math.max(-1000, Math.min(1000, newIndicators[k])); // Allow wider range for energy
      }
    });
    return newIndicators;
  }, []);

  const updateGameState = useCallback((newBuildings: PlacedBuilding[], newTurn: number) => {
    const newIndicators = calculateIndicators(newBuildings);
    let newAvailableBuildings = [...gameState.availableBuildings];
    let newUnlockedTerrain = gameState.unlockedTerrainAreas;
    const currentHouses = newBuildings.filter(b => b.type === BuildingType.SUSTAINABLE_HOUSE).length;

    if (!newAvailableBuildings.includes(BuildingType.SOLAR_PANEL_ARRAY) && newBuildings.length >= 2) {
      newAvailableBuildings.push(BuildingType.SOLAR_PANEL_ARRAY);
    }
    
    if (!newAvailableBuildings.includes(BuildingType.WATER_TREATMENT) &&
        newBuildings.some(b => b.type === BuildingType.SUSTAINABLE_HOUSE) && 
        (newIndicators.waterQuality < 45 || newIndicators.population >= POPULATION_PER_HOUSE * 2) 
    ) {
      newAvailableBuildings.push(BuildingType.WATER_TREATMENT);
    }
    
    if (!newAvailableBuildings.includes(BuildingType.WASTE_COLLECTION) && currentHouses >= 3) { 
      newAvailableBuildings.push(BuildingType.WASTE_COLLECTION);
    }

     if (!newAvailableBuildings.includes(BuildingType.REFORESTATION_AREA) && newIndicators.biodiversity < 50 && newBuildings.length >= 4) {
      newAvailableBuildings.push(BuildingType.REFORESTATION_AREA);
    }
    
    if (!newAvailableBuildings.includes(BuildingType.COMMUNITY_CENTER) && newIndicators.communityHappiness < 60 && currentHouses >= 3) {
      newAvailableBuildings.push(BuildingType.COMMUNITY_CENTER);
    }

    // Unlock School
    if (!newAvailableBuildings.includes(BuildingType.SCHOOL) && newIndicators.population >= POPULATION_PER_HOUSE * 3) { // Population >= 12
        newAvailableBuildings.push(BuildingType.SCHOOL);
    }

    // Unlock Health Post
    if (!newAvailableBuildings.includes(BuildingType.HEALTH_POST) && newIndicators.population >= POPULATION_PER_HOUSE * 2) { // Population >= 8
        newAvailableBuildings.push(BuildingType.HEALTH_POST);
    }


    const strategicBuildingsCount = newBuildings.filter(b => b.type === BuildingType.SUSTAINABLE_HOUSE || b.type === BuildingType.COMMUNITY_CENTER).length;
    const expectedUnlocks = Math.floor(strategicBuildingsCount / TERRAIN_UNLOCK_THRESHOLD);
    if (expectedUnlocks > newUnlockedTerrain) {
        newUnlockedTerrain = expectedUnlocks;
    }

    const newHistoryEntry: HistoricDataPoint = { turn: newTurn, indicators: newIndicators };
    
    // Ensure unique buildings in availableBuildings
    newAvailableBuildings = [...new Set(newAvailableBuildings)];

    setGameState(prev => ({
      ...prev,
      placedBuildings: newBuildings,
      indicators: newIndicators,
      availableBuildings: newAvailableBuildings,
      unlockedTerrainAreas: newUnlockedTerrain,
      history: [...prev.history, newHistoryEntry],
      currentTurn: newTurn,
      selectedBuildingForInfo: null 
    }));
  }, [calculateIndicators, gameState.availableBuildings, gameState.unlockedTerrainAreas, gameState.history]);


  const handlePlaceBuilding = useCallback((position: GameVector3, type: BuildingType) => {
    const definition = BUILDING_DEFINITIONS[type];
    if (!definition) return;

    if (definition.effects.energy && definition.effects.energy < 0 && gameState.indicators.energyBalance < Math.abs(definition.effects.energy) && type !== BuildingType.SOLAR_PANEL_ARRAY) {
        alert("Energia insuficiente para construir este edifício! Construa mais geradores.");
        setSelectedBuildingTypeForPlacement(null);
        return;
    }

    const newBuilding: PlacedBuilding = {
      ...definition,
      id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      position,
    };
    const newBuildings = [...gameState.placedBuildings, newBuilding];
    const nextTurn = gameState.currentTurn + 1;
    updateGameState(newBuildings, nextTurn);
    setSelectedBuildingTypeForPlacement(null);
  }, [gameState.placedBuildings, gameState.indicators.energyBalance, gameState.currentTurn, updateGameState]);


  const handleCloseChallengeModal = useCallback(() => {
    const currentChallengeId = gameState.currentChallenge?.id;
    if (currentChallengeId) {
        setAcknowledgedChallengeIdForTurn(currentChallengeId);
    }
    setGameState(prev => ({ ...prev, currentChallenge: null }));
  }, [gameState.currentChallenge]);

  const handleShowIndicatorInfo = useCallback((key: keyof IndicatorLevels) => {
    setInfoForIndicatorKey(key);
  }, []);
  
  const handleCloseIndicatorInfoModal = useCallback(() => {
    setInfoForIndicatorKey(null);
  }, []);

  useEffect(() => {
    if (gameState.currentTurn > 0) { 
        setAcknowledgedChallengeIdForTurn(null);
    }
  }, [gameState.currentTurn]);


  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBuildingTypeForPlacement(null);
        handleCloseChallengeModal();
        setShowDashboard(false);
        handleCloseIndicatorInfoModal();
      }
    };

    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [handleCloseChallengeModal, handleCloseIndicatorInfoModal]); 

  useEffect(() => {
    if (gameState.currentChallenge || showWelcome || showDashboard || infoForIndicatorKey) return; 

    const availableChallenges = CHALLENGES_DEFINITION.filter(ch => 
        !gameState.completedChallengeIds.includes(ch.id) &&
        ch.id !== acknowledgedChallengeIdForTurn 
    );
    let nextChallenge: Challenge | undefined = undefined;
    const currentHousesCount = gameState.placedBuildings.filter(b => b.type === BuildingType.SUSTAINABLE_HOUSE).length;

    for (const ch of availableChallenges) {
        let conditionMet = false;
        if (ch.id === 'challenge1_energy' && gameState.placedBuildings.length >=3 && gameState.indicators.energyBalance <=5) conditionMet = true;
        
        if (ch.id === 'challenge2_clean_water' && 
            gameState.indicators.waterQuality <= 45 && 
            gameState.indicators.population >= POPULATION_PER_HOUSE * 2 && 
            !gameState.placedBuildings.some(b => b.type === BuildingType.WATER_TREATMENT)) {
            conditionMet = true;
        }

        if (ch.id === 'challenge3_happiness' && 
            gameState.indicators.communityHappiness <= 55 && 
            currentHousesCount >=3 && 
            !gameState.placedBuildings.some(b=>b.type === BuildingType.COMMUNITY_CENTER)) {
            conditionMet = true;
        }

        if (ch.id === 'challenge4_waste_management' &&
            currentHousesCount >= 10 && // Adjusted from 4 to 10
            !gameState.placedBuildings.some(b => b.type === BuildingType.WASTE_COLLECTION)) {
            conditionMet = true;
        }
        
        if (conditionMet) {
            nextChallenge = ch;
            break;
        }
    }

    if (nextChallenge) {
      setGameState(prev => ({ ...prev, currentChallenge: nextChallenge }));
    }
  }, [gameState.indicators, gameState.placedBuildings, gameState.currentChallenge, gameState.completedChallengeIds, showWelcome, showDashboard, infoForIndicatorKey, acknowledgedChallengeIdForTurn, gameState.indicators.population]);

  useEffect(() => {
    if (gameState.currentChallenge && !gameState.completedChallengeIds.includes(gameState.currentChallenge.id) && gameState.currentChallenge.goal(gameState)) {
      alert(`Desafio Concluído: ${gameState.currentChallenge.title}\n${gameState.currentChallenge.reward}`);
      const challengeId = gameState.currentChallenge.id;
      setGameState(prev => ({
        ...prev,
        currentChallenge: null, // Close modal after completion
        completedChallengeIds: [...new Set([...prev.completedChallengeIds, challengeId])]
      }));
       setAcknowledgedChallengeIdForTurn(challengeId); // Acknowledge completion for this turn
    }
  }, [gameState]);


  const indicatorKeyToNameMapping: Record<keyof IndicatorLevels, string> = {
    airQuality: "Qualidade do Ar",
    waterQuality: "Qualidade da Água",
    communityHappiness: "Felicidade da Comunidade",
    biodiversity: "Biodiversidade",
    energyBalance: "Balanço de Energia",
    foodSupply: "Suprimento de Alimentos",
    population: "População"
  };

  const indicatorKeyToColorMapping: Record<keyof IndicatorLevels, string> = {
    airQuality: "#3b82f6", 
    waterQuality: "#06b6d4", 
    communityHappiness: "#ec4899", 
    biodiversity: "#10b981", 
    energyBalance: "#eab308", 
    foodSupply: "#84cc16", 
    population: "#64748b" 
  };
  
  const currentIndicatorInfo = infoForIndicatorKey ? INDICATOR_PEDAGOGICAL_INFO[infoForIndicatorKey] : null;

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-200 dark:bg-gray-900 relative overflow-hidden">
      {/* Top Indicators Bar */}
      <TopBarIndicatorsDisplay
        indicators={gameState.indicators}
        onShowInfo={handleShowIndicatorInfo}
        onToggleDashboard={() => setShowDashboard(prev => !prev)}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        currentTheme={theme}
      />

      {/* Main content area: Sidebar + Scene */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Side Build Menu */}
        <div className="w-48 sm:w-56 md:w-64 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 z-10 flex flex-col overflow-y-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-center text-green-800 dark:text-green-300 mb-2">Construir</h3>
          <div className="flex flex-col space-y-2 flex-grow">
            {gameState.availableBuildings.map(type => {
              const def = BUILDING_DEFINITIONS[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedBuildingTypeForPlacement(type)}
                  title={`${def.name} - ${def.description}`}
                  className={`p-2.5 rounded shadow text-sm transition-all w-full
                              ${selectedBuildingTypeForPlacement === type ? 'bg-green-600 dark:bg-green-500 text-white ring-2 ring-green-400 dark:ring-green-300'
                                                                          : 'bg-white dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 text-green-700 dark:text-green-300'}
                              flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400`}
                >
                  <span className="font-medium text-center block w-full text-xs sm:text-sm leading-tight">{def.name}</span>
                  {def.effects.energy !== undefined && <span className={`text-xs ${def.effects.energy > 0 ? 'text-yellow-700 dark:text-yellow-500' : 'text-red-700 dark:text-red-500'}`}>{def.effects.energy > 0 ? '+' : ''}{def.effects.energy} E</span>}
                  {def.effects.food !== undefined && <span className="text-xs text-lime-700 dark:text-lime-500">+{def.effects.food} A</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 3D Scene Area */}
        <div className="flex-grow relative h-full">
          <ThreeScene
            placedBuildings={gameState.placedBuildings}
            onPlaceBuilding={handlePlaceBuilding}
            selectedBuildingTypeForPlacement={selectedBuildingTypeForPlacement}
            indicators={gameState.indicators}
            unlockedTerrainAreas={gameState.unlockedTerrainAreas}
          />
           {selectedBuildingTypeForPlacement && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3.5 bg-indigo-700/80 dark:bg-indigo-600/80 text-white rounded-md text-base shadow-lg z-20 pointer-events-none animate-pulse">
              Modo Construção: {BUILDING_DEFINITIONS[selectedBuildingTypeForPlacement].name}. Clique no terreno para construir. (ESC para cancelar)
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showWelcome && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-xl max-w-xl text-center">
                  <h1 className="text-4xl font-bold text-green-700 dark:text-green-400 mb-6">Bem-vindo à Vila Verde!</h1>
                  <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg">
                      Seu desafio é construir uma comunidade próspera que viva em harmonia com a natureza.
                      Clique nos botões abaixo para selecionar edifícios e depois clique no terreno para construir.
                      Observe os indicadores e tome decisões sustentáveis! (Pressione ESC para cancelar ações ou fechar pop-ups)
                  </p>
                  <button
                      onClick={() => setShowWelcome(false)}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded transition-colors text-lg"
                  >
                      Começar a Construir
                  </button>
              </div>
          </div>
      )}

      {gameState.currentChallenge && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 p-4" role="alertdialog" aria-modal="true" aria-labelledby="challenge-title" aria-describedby="challenge-desc">
              <div className="bg-lime-50 dark:bg-lime-900 p-8 rounded-lg shadow-xl max-w-lg text-center border-2 border-lime-600 dark:border-lime-400 w-full" onClick={e => e.stopPropagation()}>
                  <h2 id="challenge-title" className="text-3xl font-bold text-lime-700 dark:text-lime-300 mb-4">🔔 Novo Desafio!</h2>
                  <h3 className="text-2xl font-semibold text-lime-600 dark:text-lime-400 mb-3">{gameState.currentChallenge.title}</h3>
                  <p id="challenge-desc" className="text-gray-700 dark:text-gray-300 mb-5 text-base">{gameState.currentChallenge.description}</p>
                  <div className="bg-lime-100 dark:bg-lime-800 p-4 rounded my-4">
                      <p className="text-base text-lime-800 dark:text-lime-200 font-semibold mb-1">Meta para recompensa:</p>
                      <p className="text-sm text-lime-700 dark:text-lime-300">{gameState.currentChallenge.reward}</p>
                  </div>
                  <button
                      onClick={handleCloseChallengeModal}
                      className="mt-5 px-6 py-2.5 bg-lime-600 hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-600 text-white rounded transition-colors text-base"
                  >
                      Entendido!
                  </button>
              </div>
          </div>
      )}

      {showDashboard && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 p-2 sm:p-4" onClick={() => setShowDashboard(false)} role="dialog" aria-modal="true" aria-labelledby="dashboard-title">
              <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 id="dashboard-title" className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400">Dashboard da Vila</h2>
                      <button onClick={() => setShowDashboard(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Fechar dashboard">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Indicadores Atuais (Turno: {gameState.currentTurn})</h3>
                          <div className="space-y-1.5 text-sm sm:text-base">
                              {Object.entries(gameState.indicators).map(([key, value]) => {
                                  const label = indicatorKeyToNameMapping[key as keyof IndicatorLevels] || key;
                                  const historyForTrend = gameState.history.length > 1 ? gameState.history[gameState.history.length - 2] : null;
                                  const previousValue = historyForTrend ? historyForTrend.indicators[key as keyof IndicatorLevels] : undefined;
                                  const trend = getTrend(value, previousValue);
                                  const unit = (key === 'energyBalance' || key === 'population') ? '' : '%';
                                  
                                  let icon = <SunIcon />;
                                  if (key === 'waterQuality') icon = <WaterIcon/>;
                                  if (key === 'communityHappiness') icon = <HeartIcon/>;
                                  if (key === 'biodiversity') icon = <LeafIcon/>;
                                  if (key === 'energyBalance') icon = <BoltIcon/>;
                                  if (key === 'foodSupply') icon = <FoodIcon/>;
                                  if (key === 'population') icon = <UserGroupIcon/>;

                                  return (
                                      <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                          <div className="flex items-center">
                                            <span className="mr-2.5 text-green-600 dark:text-green-400">{icon}</span>
                                            <span>{label}:</span>
                                          </div>
                                          <span className="font-semibold">{value.toFixed(0)}{unit} {trend && <span className={`ml-1.5 ${trend === '▲' ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>}</span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                      <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Sumário da Vila</h3>
                          <div className="space-y-1.5 text-sm sm:text-base">
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><span>Total de Edifícios:</span> <span className="font-semibold">{gameState.placedBuildings.length}</span></div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><span>Áreas Desbloqueadas:</span> <span className="font-semibold">{gameState.unlockedTerrainAreas}</span></div>
                             <h4 className="text-base font-semibold text-gray-600 dark:text-gray-400 mt-3 mb-1.5">Contagem por Tipo:</h4>
                             {Object.entries(
                                gameState.placedBuildings.reduce((acc, building) => {
                                    acc[building.name] = (acc[building.name] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                             ).length > 0 ? Object.entries(
                                gameState.placedBuildings.reduce((acc, building) => {
                                    acc[building.name] = (acc[building.name] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                             ).map(([name, count]) => (
                                <div key={name} className="flex justify-between pl-3 p-1 bg-gray-50 dark:bg-gray-700/30 rounded text-sm"><span>{name}:</span> <span className="font-semibold">{count}</span></div>
                             )) : <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-3">Nenhum edifício construído.</p>}
                          </div>
                      </div>
                  </div>
                  <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">Evolução dos Indicadores (Últimos 5 Turnos)</h3>
                      {gameState.history && gameState.history.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(Object.keys(INITIAL_INDICATORS) as Array<keyof IndicatorLevels>).map(indicatorKey => {
                            const chartData = gameState.history.slice(-5).map(entry => ({
                              turn: entry.turn,
                              value: entry.indicators[indicatorKey]
                            }));
                            
                            const values = chartData.map(d => d.value);
                            let valueMin = Math.min(...values);
                            let valueMax = Math.max(...values);
                            const padding = (valueMax - valueMin) * 0.1 || 5; 

                            valueMin = (indicatorKey !== 'energyBalance' && indicatorKey !== 'population') ? 
                                       Math.max(0, valueMin - padding) : (valueMin - padding);
                            valueMax = (indicatorKey !== 'energyBalance' && indicatorKey !== 'population') ? 
                                       Math.min(100, valueMax + padding) : (valueMax + padding);
                            
                            if (valueMin > valueMax -1) valueMin = valueMax -1; 
                            if (valueMax === valueMin) valueMax +=1; 

                            if (indicatorKey !== 'energyBalance' && indicatorKey !== 'population') {
                              valueMin = Math.max(0, valueMin);
                              valueMax = Math.min(100, valueMax);
                            }

                            return (
                              <LineChart
                                key={indicatorKey}
                                title={indicatorKeyToNameMapping[indicatorKey]}
                                data={chartData}
                                width={280} 
                                height={150} 
                                lineColor={indicatorKeyToColorMapping[indicatorKey]}
                                valueMin={valueMin}
                                valueMax={valueMax}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-base text-gray-500 dark:text-gray-400 italic text-center">Nenhum histórico de indicadores disponível para gráficos.</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {currentIndicatorInfo && (
        <div 
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
            onClick={handleCloseIndicatorInfoModal} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="indicator-info-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-xl w-full" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 id="indicator-info-title" className="text-2xl font-bold text-green-700 dark:text-green-400">{currentIndicatorInfo.title}</h3>
                    <button onClick={handleCloseIndicatorInfoModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Fechar Informações">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">{currentIndicatorInfo.explanation}</p>
                
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1.5 text-lg">Como Melhorar:</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-1.5 text-base">{currentIndicatorInfo.howToImprove}</p>
                {currentIndicatorInfo.relevantPositiveBuildings.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">Edifícios úteis: {currentIndicatorInfo.relevantPositiveBuildings.map(type => BUILDING_DEFINITIONS[type].name).join(', ')}.</p>
                )}

                {currentIndicatorInfo.whatWorsens && (
                    <>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1.5 text-lg">O Que Piora:</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-1.5 text-base">{currentIndicatorInfo.whatWorsens}</p>
                        {currentIndicatorInfo.relevantNegativeBuildings && currentIndicatorInfo.relevantNegativeBuildings.length > 0 && (
                             <p className="text-sm text-gray-500 dark:text-gray-500">Edifícios que impactam: {currentIndicatorInfo.relevantNegativeBuildings.map(type => BUILDING_DEFINITIONS[type].name).join(', ')}.</p>
                        )}
                    </>
                )}
                <button
                    onClick={handleCloseIndicatorInfoModal}
                    className="mt-6 px-5 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded transition-colors w-full text-lg"
                >
                    Entendido
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
