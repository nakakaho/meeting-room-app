// src/components/common/ErrorDisplay.jsx
import { Alert, Box } from '@mui/material';

const ErrorDisplay = ({ errors, generalError, successMessage }) => {
  if (!errors && !generalError && !successMessage) return null;

  return (
    <Box sx={{ mt: 2 }}>
      {/* 成功メッセージ */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {successMessage}
        </Alert>
      )}

      {/* バリデーションエラー（複数） */}
      {errors && Object.entries(errors).map(([field, messages]) => (
        <Alert key={field} severity="error" sx={{ mb: 1 }}>
          {messages[0]}
        </Alert>
      ))}

      {/* 一般エラー（単一） */}
      {generalError && (
        <Alert severity="error">
          {generalError}
        </Alert>
      )}
    </Box>
  );
};

export default ErrorDisplay;