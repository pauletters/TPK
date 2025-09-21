import React from 'react';
import allClassFeatures from '../Features/ClassFeatures';

interface FeaturesProps {
  characterClass: string;
  characterLevel: number;
  classFeatures: Array<{
    name: string;
    levelRequired: number;
    description: string;
    selections?: Array<{
      selectedOption: string;
    }>;
  }>;
}

const CombinedFeatures: React.FC<FeaturesProps> = ({
  characterClass,
  classFeatures
}) => {
  // Get static features for the character's class
  const lowerClass = characterClass.toLowerCase() as keyof typeof allClassFeatures;
  const staticFeatures = allClassFeatures[lowerClass]?.features || [];
  
  // Create a Set of feature names that have user selections
  const selectedFeatureNames = new Set(classFeatures.map(f => f.name));

  // Filter out static features that have user selections
  const filteredStaticFeatures = staticFeatures.filter(
    (feature: { name: string }) => !selectedFeatureNames.has(feature.name)
  );
  
  // Combine filtered static features and selected features
  const allFeatures = [
    ...filteredStaticFeatures.map((feature: { name: string; description: string }) => ({
      name: feature.name,
      levelRequired: 1, // Static features are typically level 1
      description: feature.description,
      isStatic: true,
      selections: []
    })),
    ...classFeatures.map(feature => ({
      ...feature,
      isStatic: false
    }))
  ];

  // Sort features by level requirement
  const sortedFeatures = allFeatures.sort((a, b) => a.levelRequired - b.levelRequired);

  return (
    <ul className="list-unstyled">
      {sortedFeatures.map((feature, index) => (
        <li key={index} className="mb-3">
          <strong>{feature.name}</strong> ({feature.levelRequired} Level)
          <div className={`small ${feature.isStatic ? 'text-primary' : 'text-muted'}`}>
            {feature.description}
          </div>
          {!feature.isStatic && feature.selections && feature.selections.length > 0 && (
            <div className="mt-1 small">
              <span className="text-success">
                Selected: {feature.selections.map((selection: { selectedOption: string }) => selection.selectedOption).join(', ')}
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CombinedFeatures;