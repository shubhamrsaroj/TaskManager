import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
  Paper,
  Card,
  CardContent,
  useTheme,
  alpha,
  keyframes,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
  DevicesOther as DevicesIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useCategories } from '../../contexts/CategoryContext.tsx';

// Define animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { categories, loading, error: categoryError, addCategory, initializeDefaultCategories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate username format
      if (!/^[a-zA-Z0-9_-]{3,}$/.test(username)) {
        setError('Username must be at least 3 characters long and can only contain letters, numbers, underscores, and hyphens');
        return;
      }

      // Validate password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        username,
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Initialize default categories after successful registration
      await initializeDefaultCategories();
      
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || error.response?.data?.error || 'An error occurred');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const features = [
    {
      title: 'Secure Platform',
      description: 'Your data is protected with industry-standard encryption',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      delay: '0s',
    },
    {
      title: 'Fast & Responsive',
      description: 'Lightning-fast performance across all devices',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      delay: '0.2s',
    },
    {
      title: 'Cloud Sync',
      description: 'Access your tasks from anywhere, anytime',
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      color: '#ec4899',
      delay: '0.4s',
    },
    {
      title: 'Cross-Platform',
      description: 'Works seamlessly across all your devices',
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      color: '#f43f5e',
      delay: '0.6s',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(-45deg, #6366f1, #8b5cf6, #ec4899, #f43f5e)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `repeating-linear-gradient(
            45deg,
            #fff,
            #fff 10px,
            transparent 10px,
            transparent 20px
          )`,
        }}
      />

      {/* Floating Circles */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: ['50px', '100px', '150px'][i % 3],
            height: ['50px', '100px', '150px'][i % 3],
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
            animation: `${float} ${3 + i}s ease-in-out infinite`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ my: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Left side - Welcome Content */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                color: 'white',
                mt: 8,
                animation: `${fadeIn} 1s ease-out`,
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Join Task Manager
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 6,
                  opacity: 0.9,
                  animation: `${shimmer} 3s infinite linear`,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  backgroundSize: '1000px 100%',
                }}
              >
                Start organizing your tasks and boost your productivity today
              </Typography>

              {/* Feature Cards */}
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: alpha('#fff', 0.9),
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease-in-out',
                        animation: `${fadeIn} 0.5s ease-out forwards`,
                        animationDelay: feature.delay,
                        opacity: 0,
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 30px -10px ${alpha(feature.color, 0.3)}`,
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            color: feature.color,
                          }}
                        >
                          <Box
                            sx={{
                              animation: `${float} 3s ease-in-out infinite`,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                            {feature.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right side - Register Form */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={24}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                background: alpha('#fff', 0.9),
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                animation: `${fadeIn} 0.5s ease-out`,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                  background: 'linear-gradient(45deg, #6366f1, #f43f5e)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                Create Account
              </Typography>
              {error && (
                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                  error={password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    autoComplete: 'new-password'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.2,
                    background: 'linear-gradient(45deg, #6366f1, #f43f5e)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                    },
                  }}
                >
                  Sign Up
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    href="/login"
                    variant="body2"
                    sx={{
                      color: '#6366f1',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: '#f43f5e',
                      },
                    }}
                  >
                    {"Already have an account? Sign In"}
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;
