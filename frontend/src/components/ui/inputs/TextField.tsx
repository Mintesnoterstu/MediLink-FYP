import React from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const TextField: React.FC<TextFieldProps> = (props) => {
  return <StyledTextField {...props} />;
};

