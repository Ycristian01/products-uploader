import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { CheckCircleOutlineOutlined, CloudUploadRounded, ErrorOutlineOutlined } from '@mui/icons-material';
import { useState } from 'react';
import axios from 'axios';

export default function UploadForm() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileUpload = async (event: any) => {
    event.preventDefault();
    setUploadProgress(0);
    setUploadComplete(false);
    setUploadError(null);

    const formData = new FormData();
    const file = event.target.elements.fileInput.files[0];
    formData.append('file', file);
    

    try {
      const response = await axios.post(`${backendBaseUrl}/upload-products`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            console.log('progressEvent', progressEvent)
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('percentCompleted', percentCompleted)
            setUploadProgress(percentCompleted);
          }
        }, 
      });
      setUploadMessage(response.data?.message);
      setUploadComplete(true);
    } catch (error: any) {
      console.error('Error uploading file:', error.response.data.error);
      setUploadError(error.response.data.error);
    }
  };

  const handleFileChange = async () => {
    setUploadProgress(0);
    setUploadComplete(false);
    setUploadError(null);
    setUploadMessage(null);
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h5" color='black' gutterBottom>
          Upload products
        </Typography>
        <form style={{ width: '100%' }} onSubmit={handleFileUpload}>
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
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Typography variant="body2" color="textSecondary">
              Upload Progress: {uploadProgress}%
            </Typography>
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
    </Container>
  );
}