---
description: Project structure, organization, and best practices for backend-commerce Express.js API
globs: src/**/*
alwaysApply: true
---

# Backend-Commerce Project Structure & Organization

## 1. Directory Structure

```
src/
├── controllers/        # HTTP request handlers, organized by feature
├── services/           # Business logic layer, organized by feature
├── models/             # Mongoose schemas and database layer
├── routes/             # Route definitions, aggregated in index.ts
├── middleware/         # Express middleware (auth, validation, error handling)
├── lib/                # External service configurations (Stripe, Cloudinary)
├── config/             # Environment-specific configurations
├── types/              # TypeScript type definitions and interfaces
└── utils/              # Utility functions and helpers
```

## 2. Feature-Based Organization

Organize controllers and services by feature/domain:

```
controllers/
├── user/               # All user-related operations
│   ├── register-user-controller.ts
│   ├── login-user-controller.ts
│   ├── user-detail.controller.ts
│   └── admin-user-controller.ts
├── product/
├── cart/
├── orders/
├── address/
└── shipping/

services/
├── user/               # Matches controller structure
├── product/
├── cart/
├── orders/
└── shipping/
```

**Benefits:**
- Easier to locate related code
- Clear feature boundaries
- Simpler testing (feature-level test files)

---

## 3. Separation of Concerns: Controllers → Services → Models

### Controllers (`src/controllers/`)
- **Responsibility**: Handle HTTP requests and responses only
- **Do**: Parse request params, call services, return responses
- **Don't**: Database queries, business logic, validation logic

```typescript
// ✅ Good
export const getUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await getUserService(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ❌ Bad - Business logic in controller
export const getUserController = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (user.role === 'admin') {
    // ... complex business logic here
  }
};
```

### Services (`src/services/`)
- **Responsibility**: Implement business logic
- **Do**: Data validation, orchestration, calculations, external API calls
- **Don't**: HTTP concerns, request/response handling

```typescript
// ✅ Good
export const getUserService = async (userId: string) => {
  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};
```

### Models (`src/models/`)
- **Responsibility**: Define schemas and database layer only
- **Do**: Schema definition, indexes, validations, static/instance methods
- **Don't**: Business logic beyond data validation

```typescript
// ✅ Good schema with validation
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
```

---

## 4. Routing & Routes Structure

### Route Organization (`src/routes/`)

```typescript
// routes/index.ts - Main aggregation point
import express from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;
```

### Individual Route Files

```typescript
// routes/userRoutes.ts
import express from 'express';
import { registerUserController } from '../controllers/user/register-user-controller';
import { loginUserController } from '../controllers/user/login-user-controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUserController);
router.post('/login', loginUserController);
router.get('/profile', authMiddleware, getUserDetailController);

export default router;
```

**Rules:**
- One route file per feature domain
- Keep routes simple (minimal logic)
- Attach middleware directly in route definitions
- Use descriptive HTTP methods (GET, POST, PUT, DELETE)

---

## 5. Middleware Organization (`src/middleware/`)

### Middleware Execution Order

```typescript
// server.ts - Proper middleware stack
app.use(cors()); // CORS first
app.use(express.json()); // Parse JSON
app.use(cookieParser()); // Parse cookies
app.use(requestLogger); // Logging
app.use('/uploads', multerMiddleware); // File uploads for specific routes
app.use(validateRequest); // Validation
app.use(authMiddleware); // Authentication
app.use(authorizationMiddleware); // Authorization
app.use(routes); // Routes
app.use(errorHandler); // Error handling LAST
```

### Middleware Best Practices

- **Authentication (`authMiddleware.ts`)**: Verify JWT tokens
- **Authorization (`adminMiddleware.ts`)**: Check user roles/permissions
- **Validation**: Validate request body/params early
- **File Upload (`multer.ts`)**: Configure upload limits and storage
- **Error Handling**: Centralized error middleware at the end

```typescript
// ✅ Good middleware pattern
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 6. TypeScript Types Organization (`src/types/`)

### Global Type Definitions

```typescript
// types/express/index.ts - Extend Express types
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin';
      };
    }
  }
}

// types/user.ts - Feature-specific types
export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// types/cart.ts
export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
}
```

**Rules:**
- Keep types close to where they're used
- Export types from a central location when shared
- Use interfaces for objects, types for primitives/unions
- Avoid `any` type - use generics instead

---

## 7. Configuration & Environment (`src/config/`)

### Configuration Pattern - DO NOT EXPOSE SECRETS

```typescript
// config/database.ts
export const mongoConnection = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  }
};

// config/stripe.ts - Load from environment variables ONLY
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// config/cloudinary.ts - Load from environment variables ONLY
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

**Critical Rules:**
- ✅ Load secrets ONLY from environment variables
- ✅ Use `.env.local` (gitignored) for local development
- ✅ Initialize external services in config files only
- ✅ Never commit `.env` files
- ✅ Create `.env.example` with placeholder values (NO REAL KEYS)
- ❌ Never log secrets or API keys
- ❌ Never hardcode credentials in code
- ❌ Never expose secrets in error messages

```typescript
// ❌ NEVER DO THIS
const stripe = new Stripe('sk_live_51234567890abcdef');

// ❌ NEVER DO THIS
console.log(`Stripe key: ${process.env.STRIPE_SECRET_KEY}`);

// ✅ DO THIS
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

---

## 8. Error Handling Strategy

### Custom Error Classes

```typescript
// utils/customErrors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

### Global Error Handler Middleware

```typescript
// middleware/errorHandler.ts
export const errorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, error);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      // Never expose sensitive details in production
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

// Use in async routes with try-catch
router.post('/register', async (req, res, next) => {
  try {
    // ... business logic
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

---

## 9. Naming Conventions

### Files & Directories
- **Feature folders**: lowercase, plural when multiple (e.g., `user/`, `products/`)
- **Files**: kebab-case with suffix (e.g., `register-user-controller.ts`, `add-product-service.ts`)
- **Controllers**: `*-controller.ts`
- **Services**: `*-service.ts`
- **Models**: `*Model.ts`
- **Routes**: `*Routes.ts`

### Functions & Variables
```typescript
// Controllers - verb + noun + Controller
export const registerUserController = async (req, res) => {};

// Services - verb + noun + Service or just action
export const getUserService = async (id) => {};
export const validateUserEmail = (email) => {};

// Database queries - verb + noun
const findUserByEmail = async (email) => {};
const updateProductStock = async (productId, quantity) => {};

// Booleans - is/has prefix
const isValidEmail = true;
const hasAdminRole = false;
const canAccessRoute = true;
```

---

## 10. Express.js Best Practices

### Async Error Handling

```typescript
// Wrap async route handlers to catch errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.post('/users', asyncHandler(registerUserController));
```

### Request/Response Pattern

```typescript
// Always return consistent response format
router.get('/products', asyncHandler(async (req, res) => {
  const products = await getProductsService();
  res.json({
    success: true,
    data: products,
    timestamp: new Date()
  });
}));

router.post('/products', asyncHandler(async (req, res) => {
  const product = await createProductService(req.body);
  res.status(201).json({
    success: true,
    data: product
  });
}));
```

---

## 11. MongoDB/Mongoose Best Practices

### Schema Definition

```typescript
// ✅ Good schema with proper types and validation
const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'food'],
    required: true
  },
  image: {
    type: String, // Store Cloudinary URL only
    default: null
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 'text' }); // For search

// Middleware for timestamps
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Product = mongoose.model('Product', productSchema);
```

### Query Best Practices

```typescript
// ✅ Use lean() for read-only queries (better performance)
const products = await Product.find({ category: 'electronics' }).lean();

// ✅ Use select() to fetch only needed fields
const user = await User.findById(userId).select('email name role -password');

// ✅ Implement pagination
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();

// ❌ Avoid - fetches all fields
const allUsers = await User.find();

// ❌ Avoid - no limit
const results = await Product.find({ category: 'electronics' });
```

---

## 12. Authentication & Security (JWT + Bcrypt)

### User Registration Service

```typescript
export const registerUserService = async (
  email: string,
  password: string,
  name: string
) => {
  // Validate input
  if (!validator.isEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Check if user exists
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  // Hash password (never store plain text)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });

  return { _id: user._id, email: user.email, name: user.name };
};
```

### JWT Token Generation - NO SECRETS IN CODE

```typescript
// ✅ DO THIS - Load from environment
export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } // Short expiration
  );
};

// Store in HTTP-only cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
});

// ❌ NEVER DO THIS
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, 'my_secret_key_12345'); // EXPOSED!
};
```

---

## 13. Payment Processing (Stripe & Razorpay)

### Stripe Integration Pattern - SECURE API KEYS

```typescript
// services/orders/create-order-stripe-service.ts
export const createStripeOrder = async (
  userId: string,
  cartItems: ICartItem[],
  amount: number
) => {
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { userId },
      idempotencyKey: `${userId}-${Date.now()}` // Prevent duplicates
    });

    // Create order in database
    const order = await Order.create({
      userId,
      items: cartItems,
      total: amount,
      stripePaymentId: paymentIntent.id,
      status: 'pending'
    });

    return { clientSecret: paymentIntent.client_secret, orderId: order._id };
  } catch (error) {
    throw new AppError('Failed to create payment', 500);
  }
};

// Webhook handler for payment confirmation
export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await updateOrderStatus(paymentIntent.metadata.orderId, 'completed');
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await updateOrderStatus(failedIntent.metadata.orderId, 'failed');
      break;
  }
};
```

**Critical Security Rules:**
- ✅ Load Stripe keys from environment variables only
- ✅ Verify webhook signatures before processing
- ✅ Never log payment details or API keys
- ❌ Never expose keys in client-side code
- ❌ Never commit keys to version control

---

## 14. File Upload (Multer + Cloudinary) - SECURE KEYS

### Multer Configuration - LOAD KEYS FROM ENV

```typescript
// middleware/multer.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Keys loaded from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/products',
    resource_type: 'auto',
    public_id: (req, file) => `${Date.now()}-${file.originalname}`
  }
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Usage in routes
router.post('/products', uploadMiddleware.single('image'), addProductController);
```

---

## 15. Environment Variables - SECURITY FIRST

### `.env.example` Template (COMMIT THIS - NO REAL KEYS)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Authentication
JWT_SECRET=your_jwt_secret_key_here_replace_in_production
JWT_EXPIRE=15m

# Node Environment
NODE_ENV=development
PORT=3000

# Stripe (Get from https://dashboard.stripe.com/)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Cloudinary (Get from https://cloudinary.com/)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### `.env.local` (GITIGNORED - YOUR REAL KEYS)

```env
# .gitignore entry
.env
.env.local
.env*.local
```

**Security Checklist:**
- ✅ Add `.env` and `.env.local` to `.gitignore`
- ✅ Use `.env.example` for documentation
- ✅ Replace placeholder values in production
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/staging/production
- ✅ Never commit real credentials
- ✅ Validate required environment variables on startup

```typescript
// Validate environment variables at startup
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_NAME'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

---

## 16. Development Workflow

### Running the Application

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

### Local Development Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Add your actual keys to .env.local
# Edit .env.local and replace placeholder values with real keys

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

---

## 17. Code Quality & Consistency

### TypeScript Configuration
- Enable `strict: true` in `tsconfig.json`
- Use noImplicitAny, noUnusedLocals, noUnusedParameters
- Always define return types for functions

### Import Organization

```typescript
// Order imports:
// 1. Node modules
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

// 2. External packages
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// 3. Local modules
import { getUserService } from '../services/user/';
import { User } from '../models/userModel';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppError } from '../utils/customErrors';
```

### Comments & Documentation

```typescript
/**
 * Register a new user
 * @param email - User email address
 * @param password - User password (will be hashed)
 * @returns User object without password
 * @throws ValidationError if email is invalid or already exists
 */
export const registerUserService = async (
  email: string,
  password: string
): Promise<{ _id: string; email: string }> => {
  // Implementation
};
```

---

## 18. Security Checklists

### ✅ Before Committing Code

- [ ] No hardcoded API keys or secrets
- [ ] No real database credentials
- [ ] `.env` files not committed (in `.gitignore`)
- [ ] Sensitive logs removed or sanitized
- [ ] No console.log of sensitive data
- [ ] `.env.example` has placeholder values only

### ✅ Production Deployment

- [ ] All secrets in environment variables
- [ ] Different credentials for dev/staging/prod
- [ ] HTTPS enabled
- [ ] CORS configured for specific domains only
- [ ] Rate limiting on payment endpoints
- [ ] Webhook signatures verified
- [ ] Logs do not contain sensitive data
- [ ] Error messages don't expose system details

---

## 19. References

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)
- [Stripe Security](https://stripe.com/docs/security)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
