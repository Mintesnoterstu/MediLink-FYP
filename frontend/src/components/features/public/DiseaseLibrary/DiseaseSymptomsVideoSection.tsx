import React from 'react';
import { Box, Typography } from '@mui/material';
import { toYouTubeEmbedUrl } from '@/utils/youtube';

interface DiseaseSymptomsVideoSectionProps {
  videoUrl?: string | null;
}

/**
 * Responsive 16:9 YouTube embed for disease symptom explainer videos.
 */
export const DiseaseSymptomsVideoSection: React.FC<DiseaseSymptomsVideoSectionProps> = ({ videoUrl }) => {
  const src = toYouTubeEmbedUrl(videoUrl);
  if (!src) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Watch Symptoms Explanation / የምልክቶች ማብራሪያ ቪዲዮ
      </Typography>
      <Box
        sx={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <iframe
          src={src}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          title="Disease symptoms video"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Watch this short video to understand the symptoms of this disease / የዚህ በሽታ ምልክቶችን
        የሚያብራራ አጭር ቪዲዮ
      </Typography>
    </Box>
  );
};
