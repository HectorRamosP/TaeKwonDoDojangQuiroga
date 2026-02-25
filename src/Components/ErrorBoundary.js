import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Componente de clase que captura errores de JavaScript en el árbol de componentes hijo
 * y muestra una interfaz de error amigable en lugar de que la aplicación se rompa.
 * En modo desarrollo también muestra el stack trace del error.
 *
 * @component
 * @extends {React.Component}
 * @param {object} props
 * @param {React.ReactNode} props.children - Componentes hijos a proteger.
 * @param {string} [props.fallbackMessage] - Mensaje personalizado a mostrar en caso de error.
 * @param {Function} [props.onError] - Callback opcional que se ejecuta cuando se captura un error.
 *
 * @example
 * <ErrorBoundary fallbackMessage="Ocurrió un error en esta sección.">
 *   <ComponenteComplejo />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              maxWidth: 600,
              textAlign: 'center'
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                marginBottom: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.props.fallbackMessage ||
                'Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                  marginTop: 2,
                  marginBottom: 2,
                  overflow: 'auto'
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ marginTop: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ marginRight: 2 }}
              >
                Intentar nuevamente
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackMessage: PropTypes.string,
  onError: PropTypes.func
};

export default ErrorBoundary;
