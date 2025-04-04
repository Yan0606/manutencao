const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutos
};

// Middleware de segurança principal
const securityMiddleware = [
  // Headers de segurança básicos
  helmet(),
  
  // Headers específicos
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  }),
  
  // Proteção XSS adicional
  helmet.xssFilter(),
  
  // Prevenir clickjacking
  helmet.frameguard({ action: 'deny' }),
  
  // Forçar HTTPS
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }),
  
  // Desabilitar cache para respostas com dados sensíveis
  helmet.noCache(),
  
  // Configuração CORS
  cors(corsOptions),
  
  // Rate limiting
  limiter,
  
  // Sanitização de dados
  (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  },
  
  // Logging de segurança
  (req, res, next) => {
    const clientIp = req.ip;
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'];
    
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${clientIp} - User-Agent: ${userAgent}`);
    }
    
    next();
  }
];

module.exports = securityMiddleware; 