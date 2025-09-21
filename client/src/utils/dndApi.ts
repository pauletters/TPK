const API_BASE_URL = 'https://www.dnd5eapi.co/api';

export interface ApiResponse<T> {
  count?: number;
  results?: T[];
  [key: string]: any;
}

interface RuleDetailsResponse {
  index: string;
  name: string;
  desc: string;
  subsections?: Array<{
    name: string;
    desc: string;
    index: string;
  }>;
}

interface RuleSectionResponse {
  name: string;
  index: string;
  desc: string;
  url: string;
  updated_at: string;
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
 // console.log('Making API request to:', url);

  try {
    const response = await fetch(url);
   // console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('API error - Status:', response.status);
      console.error('Response:', response);
      throw new Error(`API call failed: ${response.statusText}`);
    }

   // const contentType = response.headers.get('content-type');
   // console.log('Content-Type:', contentType);

    const data = await response.json();
   // console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchFromApi:', error);
    throw error;
  }
}

function formatSpellIndex(spellName: string): string {
  return spellName
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/,/g, '') // Remove commas
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export const dndApi = {
  // Character-related endpoints
  getRaces: () => fetchFromApi('/races'),
  getRace: (index: string) => fetchFromApi(`/races/${index}`),
  getClasses: () => fetchFromApi('/classes'),
  getClass: (index: string) => fetchFromApi(`/classes/${index}`),
  getBackgrounds: () => fetchFromApi('/backgrounds'),
  getBackground: (index: string) => fetchFromApi(`/backgrounds/${index}`),

  // Equipment endpoints
  getEquipment: () => fetchFromApi('/equipment'),
  getEquipmentItem: async (index: string) => {
   // console.log('Fetching equipment item for index:', index);
    const details = await fetchFromApi<any>(`/equipment/${index}`);
   // console.log('Equipment details before normalization:', details);

    if (details.properties) {
    //  console.log('Properties field:', details.properties);
    } else {
    //  console.log('No properties field found for this equipment.');
    }

    return details;
  },
  getEquipmentCategories: () => fetchFromApi('/equipment-categories'),
  getMagicItems: () => fetchFromApi('/magic-items'),

  // Spells and magic
  async getSpells() {
    console.log('getSpells called');
    try {
      console.log('Fetching all spells from /spells endpoint');
      const data = await fetchFromApi<ApiResponse<any>>('/spells');
      console.log('All spells response data:', data);
      return data;
    } catch (error) {
      console.error('Error in getSpells:', error);
      throw error;
    }
  },

  async getSpell(spellName: string) {
    console.log('getSpell called with name:', spellName);
    try {
      const formattedIndex = formatSpellIndex(spellName);
      console.log('Trying formatted spell index:', formattedIndex);

      try {
        const data = await fetchFromApi<any>(`/spells/${formattedIndex}`);
        console.log('Individual spell data:', data);
        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          console.log('First attempt failed, trying alternative format...');
          const altIndex = spellName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove all special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim();

          console.log('Trying alternative spell index:', altIndex);
          try {
            const data = await fetchFromApi<any>(`/spells/${altIndex}`);
            console.log('Spell data found with alternative format:', data);
            return data;
          } catch (altError) {
            console.log('Both attempts failed, returning placeholder data');
            // Return placeholder data if both attempts fail
            return {
              name: spellName,
              desc: ['Spell details currently unavailable'],
              school: { name: 'Unknown' },
              level: 0,
              classes: [{ name: 'Unknown' }],
              range: 'Unknown',
              casting_time: 'Unknown',
              duration: 'Unknown',
              components: ['Unknown'],
            };
          }
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in getSpell:', error);
      // Return placeholder data for any other errors
      return {
        name: spellName,
        desc: ['Spell details currently unavailable'],
        school: { name: 'Unknown' },
        level: 0,
        classes: [{ name: 'Unknown' }],
        range: 'Unknown',
        casting_time: 'Unknown',
        duration: 'Unknown',
        components: ['Unknown'],
      };
    }
  },

  async getSpellsByClass(className: string) {
    try {
      const formattedClassName = className.toLowerCase();
      const response = await fetchFromApi<ApiResponse<any>>(`/classes/${formattedClassName}/spells`);
      return response;
    } catch (error) {
      console.error(`Error fetching spells for class ${className}:`, error);
      throw error;
    }
  },

  async getClassFeatures(className: string) {
    try {
      const formattedClassName = className.toLowerCase();
      const response = await fetchFromApi<ApiResponse<any>>(`/classes/${formattedClassName}/levels/1`);
      return response;
    } catch (error) {
      console.error(`Error fetching features for class ${className}:`, error);
      throw error;
    }
  },

  // Rules and mechanics
  getConditions: () => fetchFromApi('/conditions'),
  getRules: () => fetchFromApi('/rules'),
  getRuleSections: () => fetchFromApi('/rule-sections'),
  getRuleSection: (index: string): Promise<RuleSectionResponse> => fetchFromApi(`/rule-sections/${index}`),
  getRuleDetails: (index: string): Promise<RuleDetailsResponse> => fetchFromApi(`/rules/${index}`),

  // Features and traits
  getFeatures: () => fetchFromApi('/features'),
  getTraits: () => fetchFromApi('/traits'),
  getClassTraits: () => fetchFromApi('/classes'),

  // Abilities and skills
  getAbilityScores: () => fetchFromApi('/ability-scores'),
  getSkills: () => fetchFromApi('/skills'),

  // Reference data
  getLanguages: () => fetchFromApi('/languages'),
  getProficiencies: () => fetchFromApi('/proficiencies'),
};
