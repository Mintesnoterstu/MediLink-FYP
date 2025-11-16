import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BodyMapProps {
  onLocationSelect: (location: string) => void;
  selectedLocations?: string[];
}

const bodyRegions = [
  { id: 'head', label: 'Head', x: 50, y: 10, width: 20, height: 15 },
  { id: 'neck', label: 'Neck', x: 48, y: 25, width: 24, height: 8 },
  { id: 'chest', label: 'Chest', x: 40, y: 33, width: 40, height: 20 },
  { id: 'abdomen', label: 'Abdomen', x: 42, y: 53, width: 36, height: 18 },
  { id: 'leftArm', label: 'Left Arm', x: 15, y: 30, width: 12, height: 35 },
  { id: 'rightArm', label: 'Right Arm', x: 73, y: 30, width: 12, height: 35 },
  { id: 'leftLeg', label: 'Left Leg', x: 42, y: 71, width: 12, height: 25 },
  { id: 'rightLeg', label: 'Right Leg', x: 46, y: 71, width: 12, height: 25 },
  { id: 'back', label: 'Back', x: 40, y: 33, width: 40, height: 40 },
];

export const BodyMap: React.FC<BodyMapProps> = ({ onLocationSelect, selectedLocations = [] }) => {
  const { t } = useTranslation();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleClick = (regionId: string) => {
    onLocationSelect(regionId);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, mx: 'auto', my: 2 }}>
      <Typography variant="subtitle2" gutterBottom textAlign="center">
        {t('symptoms.selectLocation')}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '150%', // Maintain aspect ratio
          bgcolor: 'background.default',
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'divider',
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
          {/* Simple body outline */}
          <ellipse cx="50" cy="17" rx="10" ry="7" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect x="48" y="24" width="4" height="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="50" cy="43" rx="20" ry="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="50" cy="62" rx="18" ry="9" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="21" cy="47" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="79" cy="47" rx="6" ry="17" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="48" cy="83" rx="6" ry="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="52" cy="83" rx="6" ry="12" fill="none" stroke="currentColor" strokeWidth="0.5" />

          {/* Interactive regions */}
          {bodyRegions.map((region) => {
            const isSelected = selectedLocations.includes(region.id);
            const isHovered = hoveredRegion === region.id;
            
            return (
              <rect
                key={region.id}
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                fill={isSelected ? 'primary.main' : isHovered ? 'primary.light' : 'transparent'}
                fillOpacity={isSelected ? 0.5 : isHovered ? 0.3 : 0}
                stroke={isSelected ? 'primary.main' : 'transparent'}
                strokeWidth="1"
                style={{ cursor: 'pointer' }}
                onClick={() => handleClick(region.id)}
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
            );
          })}
        </svg>
      </Box>
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
                color: 'primary.contrastText',
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              {region?.label || location}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};


