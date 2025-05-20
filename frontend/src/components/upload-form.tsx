import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import { CheckCircleOutlineOutlined, CloudUploadRounded, ErrorOutlineOutlined } from '@mui/icons-material';
import { useState } from 'react';
import axios from 'axios';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showProgressbar, setShowProgressbar] = useState(false);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileUpload = async (event: any) => {
    event.preventDefault();
    setUploadComplete(false);
    setUploadError(null);

    setShowProgressbar(true);

    const formData = new FormData();
    const file = event.target.elements.fileInput.files[0];
    formData.append('file', file);
    

    try {
      await axios.post(`${backendBaseUrl}/upload-products`, formData)
        .then(res => {
          setUploadMessage(res.data?.message);
          setUploadComplete(true);
          setShowProgressbar(false);
        });
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
      }, 1000);
    } catch (error: any) {
      console.error('Error uploading file:', error.response.data.message);
      setUploadError(error.response.data.message);
      setShowProgressbar(false);
    }
  };

  const handleFileChange = async () => {
    setUploadComplete(false);
    setUploadError(null);
    setUploadMessage(null);
    setShowProgressbar(false);
  }

  return (
    <Box
      sx={{
        padding: 3,
      }}
    >
      <form style={{ width: '100%' }} onSubmit={handleFileUpload}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            type="file"
            variant="outlined"
            inputProps={{ accept: 'csv/*', id: 'fileInput' }}
            margin="normal"
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            startIcon={<CloudUploadRounded />}
            sx={{ mt: 3, mb: 2 }}
          >
            Upload
          </Button>
        </Box>
        {showProgressbar && (
         <LinearProgress color="success" />
        )}
        {uploadComplete && (
          <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
            {uploadMessage} <CheckCircleOutlineOutlined sx={{ ml: 1 }} />
          </Typography>
        )}
        {uploadError && (
          <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
            {uploadError} <ErrorOutlineOutlined sx={{ ml: 1 }} />
          </Typography>
        )}
      </form>
    </Box>
  );
}