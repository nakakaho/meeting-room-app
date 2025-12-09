import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 8, 
        py: 3, 
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 NEX-ROOM. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;