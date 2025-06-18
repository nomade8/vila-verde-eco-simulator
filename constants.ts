
import { BuildingType, IndicatorLevels, Building, Challenge, GameState } from './types';

export const GRID_SIZE = 20; // Logical grid units for placement
export const CELL_SIZE = 2; // Size of each cell in 3D world units
export const INITIAL_TERRAIN_SIZE = 10; // Initial buildable area in grid units
export const POPULATION_PER_HOUSE = 4; // Number of people per sustainable house

export const BUILDING_DEFINITIONS: Record<BuildingType, Omit<Building, 'id' | 'position'>> = {
  [BuildingType.SUSTAINABLE_HOUSE]: {
    type: BuildingType.SUSTAINABLE_HOUSE,
    name: 'Casa Sustentável',
    description: 'Moradia ecológica que minimiza o impacto ambiental e promove o bem-estar.',
    effects: { communityHappiness: 5, energy: -1, biodiversity: 1 },
  },
  [BuildingType.COMMUNITY_GARDEN]: {
    type: BuildingType.COMMUNITY_GARDEN,
    name: 'Horta Comunitária',
    description: 'Produz alimentos frescos localmente, fortalece laços comunitários e melhora a biodiversidade.',
    effects: { food: 10, communityHappiness: 3, biodiversity: 5, waterQuality: 2 },
  },
  [BuildingType.SOLAR_PANEL_ARRAY]: {
    type: BuildingType.SOLAR_PANEL_ARRAY,
    name: 'Conjunto de Painéis Solares',
    description: 'Gera energia limpa a partir do sol, reduzindo a poluição do ar.',
    effects: { energy: 15, airQuality: 5 },
  },
  [BuildingType.WATER_TREATMENT]: {
    type: BuildingType.WATER_TREATMENT,
    name: 'Estação de Tratamento de Água',
    description: 'Purifica a água, tornando-a segura para reuso e protegendo os ecossistemas aquáticos.',
    effects: { waterQuality: 20, energy: -2 },
  },
  [BuildingType.WASTE_COLLECTION]: {
    type: BuildingType.WASTE_COLLECTION,
    name: 'Centro de Coleta Seletiva',
    description: 'Gerencia resíduos de forma eficaz, promovendo reciclagem e compostagem.',
    effects: { airQuality: 3, waterQuality: 3, communityHappiness: 2, energy: -1 },
  },
  [BuildingType.REFORESTATION_AREA]: {
    type: BuildingType.REFORESTATION_AREA,
    name: 'Área de Reflorestamento',
    description: 'Planta árvores nativas para aumentar a biodiversidade, melhorar a qualidade do ar e criar espaços verdes.',
    effects: { biodiversity: 15, airQuality: 8, communityHappiness: 3 },
  },
  [BuildingType.COMMUNITY_CENTER]: {
    type: BuildingType.COMMUNITY_CENTER,
    name: 'Centro Comunitário',
    description: 'Espaço para encontros, aprendizado e cultura, fortalecendo a coesão social.',
    effects: { communityHappiness: 10, energy: -1 },
  },
  [BuildingType.SCHOOL]: {
    type: BuildingType.SCHOOL,
    name: 'Escola',
    description: 'Promove educação e desenvolvimento, aumentando o conhecimento e a felicidade geral.',
    effects: { communityHappiness: 8, energy: -2 },
  },
  [BuildingType.HEALTH_POST]: {
    type: BuildingType.HEALTH_POST,
    name: 'Posto de Saúde',
    description: 'Oferece cuidados básicos de saúde, melhorando o bem-estar e a felicidade da população.',
    effects: { communityHappiness: 10, energy: -2 },
  },
};

export const INITIAL_INDICATORS: IndicatorLevels = {
  airQuality: 50,
  waterQuality: 50,
  communityHappiness: 50,
  biodiversity: 30,
  energyBalance: 0,
  foodSupply: 20,
  population: 0,
};

export const INITIAL_AVAILABLE_BUILDINGS: BuildingType[] = [
  BuildingType.SUSTAINABLE_HOUSE,
  BuildingType.COMMUNITY_GARDEN,
];

// CHALLENGES constant removed as it was defined locally in App.tsx or this version is outdated.
// If it's still needed globally, ensure it's up-to-date. For this change, assuming it's managed elsewhere.

export const MAX_INDICATOR_VALUE = 100;
export const MIN_INDICATOR_VALUE = 0;

export const TERRAIN_UNLOCK_THRESHOLD = 2; // Number of specific buildings (e.g., houses or community centers) to unlock more terrain

export interface PedagogicalInfo {
  title: string;
  explanation: string;
  howToImprove: string;
  relevantPositiveBuildings: BuildingType[];
  whatWorsens?: string;
  relevantNegativeBuildings?: BuildingType[];
}

export const INDICATOR_PEDAGOGICAL_INFO: Record<keyof IndicatorLevels, PedagogicalInfo> = {
  airQuality: {
    title: 'Qualidade do Ar',
    explanation: 'Representa a pureza do ar na vila. Ar limpo é crucial para a saúde dos habitantes e do ecossistema. Poluição industrial e queima de combustíveis fósseis pioram a qualidade do ar.',
    howToImprove: 'Invista em áreas de reflorestamento e fontes de energia limpa como painéis solares. Evite construções altamente poluentes ou compense-as.',
    relevantPositiveBuildings: [BuildingType.REFORESTATION_AREA, BuildingType.SOLAR_PANEL_ARRAY],
    whatWorsens: 'Algumas indústrias (não implementadas ainda) e o uso excessivo de energia de fontes não renováveis podem poluir o ar.',
    relevantNegativeBuildings: [] // Adicionar tipos de edifícios poluentes se/quando existirem
  },
  waterQuality: {
    title: 'Qualidade da Água',
    explanation: 'Indica a limpeza dos corpos d\'água da vila. Água pura é vital para o consumo, agricultura e vida aquática. Despejo de resíduos e falta de saneamento contaminam a água.',
    howToImprove: 'Construa Estações de Tratamento de Água. Hortas comunitárias bem manejadas também podem ajudar a filtrar a água superficial. Proteja as margens dos rios.',
    relevantPositiveBuildings: [BuildingType.WATER_TREATMENT, BuildingType.COMMUNITY_GARDEN],
    whatWorsens: 'Construções sem tratamento de esgoto adequado ou descarte incorreto de lixo próximo a rios.',
    relevantNegativeBuildings: [] // Adicionar tipos de edifícios poluentes de água se/quando existirem
  },
  communityHappiness: {
    title: 'Felicidade da Comunidade',
    explanation: 'Mede o contentamento e bem-estar geral dos habitantes. Fatores como moradia de qualidade, acesso a alimentos, lazer, cultura e um ambiente saudável contribuem para a felicidade.',
    howToImprove: 'Construa Casas Sustentáveis, Centros Comunitários, Hortas, Escolas e Postos de Saúde. Promova a biodiversidade. Garanta que as necessidades básicas como energia e alimentos estejam supridas.',
    relevantPositiveBuildings: [BuildingType.SUSTAINABLE_HOUSE, BuildingType.COMMUNITY_CENTER, BuildingType.COMMUNITY_GARDEN, BuildingType.REFORESTATION_AREA, BuildingType.SCHOOL, BuildingType.HEALTH_POST],
    whatWorsens: 'Falta de moradia, escassez de alimentos, poluição excessiva, falta de acesso à educação e saúde, e falta de espaços de convivência.',
    relevantNegativeBuildings: []
  },
  biodiversity: {
    title: 'Biodiversidade',
    explanation: 'Reflete a variedade de vida (plantas e animais) na vila. Ecossistemas ricos em biodiversidade são mais resilientes e saudáveis. Desmatamento e poluição reduzem a biodiversidade.',
    howToImprove: 'Crie Áreas de Reflorestamento, mantenha Hortas Comunitárias e garanta a qualidade da água e do ar. Evite expansão descontrolada sobre áreas verdes.',
    relevantPositiveBuildings: [BuildingType.REFORESTATION_AREA, BuildingType.COMMUNITY_GARDEN],
    whatWorsens: 'Remoção de vegetação nativa para construção sem planejamento e poluição.',
    relevantNegativeBuildings: []
  },
  energyBalance: {
    title: 'Balanço de Energia',
    explanation: 'Mostra a diferença entre a energia gerada e consumida na vila. Um balanço positivo com fontes renováveis é ideal. Dependência de fontes não renováveis ou consumo excessivo podem ser problemáticos.',
    howToImprove: 'Instale Conjuntos de Painéis Solares e outras fontes de energia renovável. Promova a eficiência energética nas construções.',
    relevantPositiveBuildings: [BuildingType.SOLAR_PANEL_ARRAY],
    whatWorsens: 'Muitas construções que consomem energia sem geração correspondente.',
    relevantNegativeBuildings: [BuildingType.SUSTAINABLE_HOUSE, BuildingType.WATER_TREATMENT, BuildingType.WASTE_COLLECTION, BuildingType.COMMUNITY_CENTER, BuildingType.SCHOOL, BuildingType.HEALTH_POST] // Edifícios que consomem
  },
  foodSupply: {
    title: 'Suprimento de Alimentos',
    explanation: 'Indica a capacidade da vila de produzir alimentos para seus habitantes. Segurança alimentar é fundamental para o bem-estar da comunidade.',
    howToImprove: 'Desenvolva Hortas Comunitárias. A diversificação da produção local é benéfica.',
    relevantPositiveBuildings: [BuildingType.COMMUNITY_GARDEN],
    whatWorsens: 'População crescente sem aumento na produção de alimentos.',
    relevantNegativeBuildings: []
  },
  population: {
    title: 'População',
    explanation: 'O número total de habitantes na sua vila. O crescimento populacional traz novos desafios e oportunidades para o desenvolvimento sustentável.',
    howToImprove: 'A população aumenta com a construção de Casas Sustentáveis. Gerencie o crescimento para não sobrecarregar os recursos e a infraestrutura.',
    relevantPositiveBuildings: [BuildingType.SUSTAINABLE_HOUSE],
    whatWorsens: 'Não aplicável diretamente, mas o crescimento descontrolado pode impactar negativamente outros indicadores se não for acompanhado de infraestrutura sustentável.',
    relevantNegativeBuildings: []
  }
};