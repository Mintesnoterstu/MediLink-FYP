import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Button } from '@mui/material';
import { FlipCameraAndroid } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface BodyMapProps {
  onLocationSelect: (location: string) => void;
  selectedLocations?: string[];
  onSelectionChange?: (locations: string[]) => void;
  view?: 'front' | 'back';
  showSystemOverlay?: boolean;
}

// Hierarchical body regions with system mapping
export const bodyRegionHierarchy = {
  'Head & Neck': {
    'Brain & Nervous': ['head', 'brain'],
    'Eyes': ['eyes'],
    'Ears': ['ears'],
    'Nose & Sinuses': ['nose', 'sinuses'],
    'Mouth & Throat': ['mouth', 'throat', 'neck'],
  },
  'Chest & Upper Body': {
    'Heart & Cardiovascular': ['chest', 'heart'],
    'Lungs & Respiratory': ['chest', 'lungs'],
    'Breast': ['breast'],
  },
  'Abdomen & Core': {
    'Stomach & Digestive': ['abdomen', 'stomach'],
    'Liver & Gallbladder': ['abdomen', 'liver'],
    'Kidneys & Urinary': ['abdomen', 'kidneys'],
    'Reproductive Organs': ['abdomen', 'pelvis'],
  },
  'Extremities': {
    'Arms & Hands': ['leftArm', 'rightArm', 'hands'],
    'Legs & Feet': ['leftLeg', 'rightLeg', 'feet'],
    'Joints & Bones': ['joints', 'bones'],
  },
  'Skin & Systemic': {
    'Entire Body': ['entireBody'],
    'Skin Surface': ['skin'],
    'Blood & Immune': ['systemic'],
  },
};

const bodyRegions = [
  // Head & Neck
  { id: 'head', label: 'Head', system: 'Head & Neck', x: 50, y: 8, width: 22, height: 14, color: '#4A90E2' },
  { id: 'brain', label: 'Brain', system: 'Head & Neck', x: 50, y: 10, width: 16, height: 10, color: '#4eb6f2' },
  { id: 'eyes', label: 'Eyes', system: 'Head & Neck', x: 50, y: 14, width: 8, height: 4, color: '#4A90E2' },
  { id: 'leftEar', label: 'Left ear', system: 'Head & Neck', x: 34, y: 14, width: 6, height: 6, color: '#4A90E2' },
  { id: 'rightEar', label: 'Right ear', system: 'Head & Neck', x: 60, y: 14, width: 6, height: 6, color: '#4A90E2' },
  { id: 'nose', label: 'Nose', system: 'Head & Neck', x: 50, y: 18, width: 4, height: 4, color: '#2C3E50' },
  { id: 'mouth', label: 'Mouth', system: 'Head & Neck', x: 50, y: 20, width: 6, height: 3, color: '#2C3E50' },
  { id: 'throat', label: 'Throat', system: 'Head & Neck', x: 48, y: 23, width: 8, height: 4, color: '#2C3E50' },
  { id: 'neck', label: 'Neck', system: 'Head & Neck', x: 48, y: 25, width: 24, height: 7, color: '#2C3E50' },

  // Chest & Upper Body
  { id: 'chest', label: 'Chest', system: 'Chest & Lungs', x: 38, y: 32, width: 42, height: 20, color: '#4A90E2' },
  { id: 'lungs', label: 'Lungs', system: 'Chest & Lungs', x: 42, y: 34, width: 16, height: 14, color: '#4eb6f2' },
  { id: 'heart', label: 'Heart', system: 'Cardiovascular', x: 48, y: 38, width: 8, height: 8, color: '#4A90E2' },
  { id: 'breast', label: 'Breast', system: 'Chest & Lungs', x: 50, y: 35, width: 8, height: 5, color: '#4eb6f2' },

  // Abdomen & Core
  { id: 'abdomen', label: 'Abdomen', system: 'Abdomen & Digestive', x: 40, y: 52, width: 38, height: 18, color: '#2C3E50' },
  { id: 'stomach', label: 'Stomach', system: 'Abdomen & Digestive', x: 47, y: 54, width: 12, height: 8, color: '#4eb6f2' },
  { id: 'liver', label: 'Liver', system: 'Abdomen & Digestive', x: 53, y: 57, width: 10, height: 6, color: '#4eb6f2' },
  { id: 'kidneyLeft', label: 'Left kidney', system: 'Renal & Urinary', x: 44, y: 59, width: 6, height: 8, color: '#4A90E2' },
  { id: 'kidneyRight', label: 'Right kidney', system: 'Renal & Urinary', x: 50, y: 59, width: 6, height: 8, color: '#4A90E2' },
  { id: 'intestines', label: 'Intestines', system: 'Abdomen & Digestive', x: 47, y: 62, width: 12, height: 10, color: '#4A90E2' },
  { id: 'pelvis', label: 'Pelvis', system: 'Reproductive', x: 45, y: 66, width: 20, height: 6, color: '#4eb6f2' },

  // Extremities
  { id: 'leftArm', label: 'Left arm', system: 'Extremities', x: 14, y: 30, width: 14, height: 35, color: '#2C3E50' },
  { id: 'rightArm', label: 'Right arm', system: 'Extremities', x: 72, y: 30, width: 14, height: 35, color: '#2C3E50' },
  { id: 'hands', label: 'Hands', system: 'Extremities', x: 50, y: 66, width: 4, height: 3, color: '#2C3E50' },
  { id: 'leftLeg', label: 'Left leg', system: 'Extremities', x: 42, y: 72, width: 12, height: 24, color: '#2C3E50' },
  { id: 'rightLeg', label: 'Right leg', system: 'Extremities', x: 46, y: 72, width: 12, height: 24, color: '#2C3E50' },
  { id: 'feet', label: 'Feet', system: 'Extremities', x: 50, y: 96, width: 6, height: 3, color: '#2C3E50' },

  // Systemic / whole body
  { id: 'entireBody', label: 'Whole body', system: 'Systemic', x: 50, y: 50, width: 60, height: 60, color: '#4A90E2' },
  { id: 'skin', label: 'Skin surface', system: 'Systemic', x: 50, y: 50, width: 62, height: 62, color: '#4eb6f2' },
  { id: 'joints', label: 'Joints', system: 'Systemic', x: 50, y: 68, width: 8, height: 8, color: '#4A90E2' },
  { id: 'muscles', label: 'Muscles', system: 'Systemic', x: 50, y: 60, width: 10, height: 10, color: '#4A90E2' },
];

const presets: Array<{ id: string; label: string; regions: string[] }> = [
  { id: 'respiratory', label: 'Respiratory', regions: ['chest', 'lungs', 'throat'] },
  { id: 'digestive', label: 'Digestive', regions: ['abdomen', 'stomach', 'liver', 'intestines'] },
  { id: 'musculoskeletal', label: 'Joints & muscles', regions: ['joints', 'muscles', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'] },
  { id: 'neurological', label: 'Neurological', regions: ['head', 'brain', 'eyes'] },
  { id: 'systemic', label: 'Systemic', regions: ['entireBody', 'skin'] },
];

export const BodyMap: React.FC<BodyMapProps> = ({
  onLocationSelect,
  selectedLocations = [],
  onSelectionChange,
  view: initialView = 'front',
  showSystemOverlay = false,
}) => {
  const { t } = useTranslation();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>(initialView);
  const [showSystems] = useState(showSystemOverlay);

  const handleClick = (regionId: string) => {
    const next = selectedLocations.includes(regionId)
      ? selectedLocations.filter((r) => r !== regionId)
      : [...selectedLocations, regionId];
    onLocationSelect(regionId);
    onSelectionChange?.(next);
  };

  const getRegionColor = (region: typeof bodyRegions[0], isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return region.color || '#25C0D3';
    if (isHovered) return '#5DD0E0';
    if (showSystems) return region.color || '#537C89';
    return 'transparent';
  };

  const getRegionOpacity = (isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return 0.6;
    if (isHovered) return 0.4;
    if (showSystems) return 0.2;
    return 0;
  };

  const applyPreset = (regions: string[]) => {
    const merged = Array.from(new Set([...selectedLocations, ...regions]));
    onSelectionChange?.(merged);
  };

  const clearAll = () => {
    onSelectionChange?.([]);
  };

  const invertSelection = () => {
    const inverted = bodyRegions
      .map((r) => r.id)
      .filter((id) => !selectedLocations.includes(id));
    onSelectionChange?.(inverted);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mx: 'auto', my: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          {t('symptoms.selectLocation') || 'Select body regions'}
        </Typography>
        <Box>
          <Tooltip title={t('bodyMap.toggleView') || 'Toggle Front/Back View'}>
            <IconButton
              size="small"
              onClick={() => setView(view === 'front' ? 'back' : 'front')}
              sx={{ color: 'primary.main' }}
            >
              <FlipCameraAndroid />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {presets.map((preset) => (
          <Button
            key={preset.id}
            size="small"
            variant="outlined"
            onClick={() => applyPreset(preset.regions)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {preset.label}
          </Button>
        ))}
        <Button size="small" variant="text" onClick={clearAll}>
          Clear all
        </Button>
        <Button size="small" variant="text" onClick={invertSelection}>
          Invert
        </Button>
      </Box>
      
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '150%',
          bgcolor: 'background.default',
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: 3,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Body outline */}
          <ellipse cx="50" cy="17" rx="10" ry="7" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <rect x="48" y="24" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="50" cy="43" rx="20" ry="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="50" cy="62" rx="18" ry="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="21" cy="47" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="79" cy="47" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="48" cy="83" rx="6" ry="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />
          <ellipse cx="52" cy="83" rx="6" ry="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={0.25} />

          {/* Interactive regions */}
          {bodyRegions.map((region, idx) => {
            const isSelected = selectedLocations.includes(region.id);
            const isHovered = hoveredRegion === region.id;
            const color = getRegionColor(region, isSelected, isHovered);
            const opacity = getRegionOpacity(isSelected, isHovered);
            
            return (
              <g key={`${region.id}-${idx}`}>
                <rect
                  x={region.x}
                  y={region.y}
                  width={region.width}
                  height={region.height}
                  fill={color}
                  fillOpacity={opacity}
                  stroke={isSelected ? '#4A90E2' : isHovered ? '#4eb6f2' : 'transparent'}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => handleClick(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                {isHovered && (
                  <text
                    x={region.x + region.width / 2}
                    y={region.y - 2}
                    textAnchor="middle"
                    fontSize="3"
                    fill="#25C0D3"
                    fontWeight="600"
                  >
                    {region.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Box>
      
      {/* Selected regions tags */}
      {selectedLocations.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mt={2} justifyContent="center">
          {selectedLocations.map((location) => {
            const region = bodyRegions.find((r) => r.id === location);
            return (
              <Box
                key={location}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {region?.label || location}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
