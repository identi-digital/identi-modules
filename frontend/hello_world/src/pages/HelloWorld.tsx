/**
 * Página principal del módulo Hello World
 * 
 * 📚 Documentación:
 * - Guía completa: docs/FRONTEND_GUIDE.md
 * - ApiClient: frontend/src/core/apiClient.ts
 */

import { useState, useEffect } from 'react';
import { ApiClient } from '@core/apiClient';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Alert } from '@mui/material';

interface Greeting {
  id: string;
  message: string;
  language?: string;
  created_at: string;
}

interface HelloWorldProps {
  config?: {
    apiUrl: string;
    backendModule: string;
  };
}

export default function HelloWorld({ config }: HelloWorldProps) {
  const [api] = useState(() => new ApiClient(
    config?.apiUrl || 'http://127.0.0.1:8000',
    config?.backendModule || 'hello-world'
  ));
  
  const [message, setMessage] = useState('');
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar saludos al montar el componente
  useEffect(() => {
    loadGreetings();
  }, []);

  const loadGreetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/greetings');
      setGreetings(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar saludos');
    } finally {
      setLoading(false);
    }
  };

  const handleHello = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/');
      setSuccess(response.message || 'Hello World!');
    } catch (err: any) {
      setError(err.message || 'Error al obtener saludo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGreeting = async () => {
    if (!message.trim()) {
      setError('Por favor ingresa un mensaje');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.post('/greetings', { message, language: 'es' });
      setSuccess('Saludo creado exitosamente');
      setMessage('');
      loadGreetings();
    } catch (err: any) {
      setError(err.message || 'Error al crear saludo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🌍 Hello World
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Este es un módulo de ejemplo que demuestra cómo crear módulos frontend en Identi Plugin System.
        <br />
        📚 Documentación: <code>docs/FRONTEND_GUIDE.md</code>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Endpoint Simple
        </Typography>
        <Button
          variant="contained"
          onClick={handleHello}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Obtener Hello World
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Prueba el endpoint GET /hello-world/
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Crear Saludo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            placeholder="Ingresa un mensaje de saludo"
          />
          <Button
            variant="contained"
            onClick={handleCreateGreeting}
            disabled={loading || !message.trim()}
          >
            Crear
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Crea un saludo que se guardará en la base de datos
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Saludos Guardados ({greetings.length})
        </Typography>
        {loading && greetings.length === 0 ? (
          <Typography>Cargando...</Typography>
        ) : greetings.length === 0 ? (
          <Typography color="text.secondary">No hay saludos guardados</Typography>
        ) : (
          <List>
            {greetings.map((greeting) => (
              <ListItem key={greeting.id}>
                <ListItemText
                  primary={greeting.message}
                  secondary={`ID: ${greeting.id} | Idioma: ${greeting.language || 'es'} | Creado: ${new Date(greeting.created_at).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        <Button
          variant="outlined"
          onClick={loadGreetings}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Actualizar Lista
        </Button>
      </Paper>
    </Box>
  );
}

