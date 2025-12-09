import { createTheme } from '@mui/material/styles';

/**
 * 言語に応じたMUIテーマを生成
 * @param {string} lang - 'jp' または 'en'
 * @returns {Theme} MUIテーマオブジェクト
 */
export const getTheme = (lang = 'jp') => {
  const fontFamily = lang === 'jp' 
    ? "'Poppins', 'Inter', sans-serif"
    : "'Inter', 'Roboto', 'Helvetica Neue', sans-serif";

  return createTheme({
    typography: {
      fontFamily: fontFamily,
      h1: { fontWeight: 700, letterSpacing: '0.5px' },
      h2: { fontWeight: 700, letterSpacing: '0.5px' },
      h3: { fontWeight: 700, letterSpacing: '0.5px' },
      h4: { fontWeight: 700, letterSpacing: '0.5px' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
      body1: { fontWeight: 400 },
      body2: { fontWeight: 400 },
    },
    palette: {
      primary: {
        main: '#ff7043',
        light: '#ffa270',
        dark: '#e05426',
        contrastText: '#fff'
      },
      secondary: {
        main: '#1c1c1f',
        light: '#69696aff',
      },
      success: {
        main: '#4caae4ff',
      },
      error: {
        main: '#e02626ff',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: fontFamily,
          },
        },
      },
    },
  });
};

// ✅ デフォルトテーマをexport（日本語）
const theme = getTheme('jp');
export default theme;