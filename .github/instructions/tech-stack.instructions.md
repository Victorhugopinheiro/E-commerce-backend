---
description: Project technology stack, versions, and best practices for backend-commerce
globs: **/*
alwaysApply: true
---

# Backend-Commerce Technology Stack

## Overview
A Node.js/Express e-commerce backend built with TypeScript, MongoDB, and integrated payment processing (Stripe & Razorpay).

---

## Core Runtime & Language

### Node.js + TypeScript
- **TypeScript**: `^5.9.2` - Latest stable with excellent type safety
  - ✅ Use strict mode in `tsconfig.json`
  - ✅ Define proper types for all controllers, services, and models
  - ✅ Leverage type inference to reduce redundant annotations

- **ts-node**: `^10.9.2` - Runtime support for development
  - Used with `nodemon` for hot-reload during development

---

## Web Framework

### Express.js `^5.2.1` (Latest)
**Best Practices:**
- ✅ Use middleware in proper order (logging → auth → validation → error handling)
- ✅ Always implement centralized error handling middleware
- ✅ Define routes in separate files and aggregate in `src/routes/index.ts`
- ✅ Use controllers to separate business logic from routing
- ✅ Document all public endpoints with proper HTTP methods
- ✅ Implement CORS correctly for frontend origin validation

**Current Implementation:**
- Routes organized by feature (`userRoutes.ts`, `cartRoutes.ts`, etc.)
- Controllers separated from routes
- Middleware for authentication (`authCart.ts`, `adminMiddlewere.ts`)

---

## Database & ORM

### MongoDB with Mongoose `^8.18.0`
**Best Practices:**
- ✅ Always define schemas with proper types and validation
- ✅ Use middleware hooks (pre/post) for side effects
- ✅ Index frequently queried fields for performance
- ✅ Implement timestamps on models (`createdAt`, `updatedAt`)
- ✅ Use lean() queries when documents don't need full Mongoose features
- ✅ Validate data at model level, not just controller level

**Current Implementation:**
- Models: `addressModel.ts`, `orderModel.ts`, `productModel.ts`, `userModel.ts`
- Consider adding indexes on frequently queried fields (user.email, product._id, etc.)
- Ensure all models have timestamps enabled

---

## Authentication & Security

### JWT (jsonwebtoken) `^9.0.3`
**Best Practices:**
- ✅ Store tokens in HTTP-only cookies (using `cookie-parser`)
- ✅ Set short expiration times (15-30 min for access tokens)
- ✅ Implement refresh token rotation
- ✅ Always validate token signatures on every request
- ✅ Clear tokens on logout

**Current Implementation:**
- Located in `controllers/user/` and `services/user/`
- Uses cookie-parser for token management
- `logout-user-service.ts` and `logout-admin-controller.ts` exist

### Bcrypt `^6.0.0`
**Best Practices:**
- ✅ Use salt rounds of 10-12 (balance between security and performance)
- ✅ Never store plain passwords
- ✅ Compare with `bcrypt.compare()`, never string comparison
- ✅ Hash passwords in service layer, not controller

**Current Implementation:**
- Used in user authentication flows
- Should be applied in `register-user-service.ts`

### Validator.js `^13.15.15`
**Best Practices:**
- ✅ Validate email format before storing
- ✅ Validate CEP format in `calculatingCepService.ts`
- ✅ Validate URLs for product images
- ✅ Sanitize user inputs to prevent XSS

---

## File Storage

### Multer `^2.0.2` + Multer-Storage-Cloudinary `^4.0.0`
**Best Practices:**
- ✅ Always validate file size and type before upload
- ✅ Use Cloudinary storage (already configured) for scalability
- ✅ Implement upload limits in middleware (`src/middleware/multer.ts`)
- ✅ Handle upload errors gracefully
- ✅ Store only metadata (URLs) in database, not file content

**Current Implementation:**
- File upload middleware in `src/middleware/multer.ts`
- Cloudinary integration in `src/config/cloudinary.ts`
- Used in product operations and possibly user avatars

### Cloudinary `^1.41.3`
**Best Practices:**
- ✅ Use transformations (resize, format) for image optimization
- ✅ Implement image versioning for cache busting
- ✅ Set appropriate folder structure for organization
- ✅ Use secure URLs (HTTPS always)

---

## Payment Processing

### Stripe `^18.5.0`
**Best Practices:**
- ✅ Use API keys from environment variables only
- ✅ Implement webhook handling for payment confirmations
- ✅ Never process sensitive card data on backend
- ✅ Implement idempotency for payment requests (prevent duplicates)
- ✅ Log all payment transactions for audit trails

**Current Implementation:**
- `src/lib/stripe.ts` - Configuration
- `create-order-stripe-controller.ts` & `create-order-stripe-service.ts`
- `src/routes/apiRoutes.ts` - Webhook handling
- Located at `webhookController.ts` and `webhookService.ts`

### Razorpay `^2.9.6`
**Best Practices:**
- ✅ Similar to Stripe - separate payment processing from order creation
- ✅ Store payment gateway references in order documents
- ✅ Handle async payment confirmations
- ✅ Implement reconciliation for failed transactions

---

## Environment & Configuration

### Dotenv `^17.2.2`
**Best Practices:**
- ✅ Store all secrets in `.env.local` (never commit)
- ✅ Validate required environment variables on startup
- ✅ Use typed configuration objects instead of direct `process.env` access
- ✅ Document all required variables in `.env.example`

**Required Variables (inferred from code):**
```
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PORT=
```

### CORS `^2.8.6`
**Best Practices:**
- ✅ Whitelist specific frontend domains in production
- ✅ Enable credentials when using cookies for auth
- ✅ Set appropriate HTTP headers (Access-Control-Allow-Credentials)
- ✅ Configure specific allowed origins instead of wildcard (*)

---

## Development Tools

### Nodemon `^3.1.10`
**Best Practices:**
- ✅ Use with `--exec ts-node` for TypeScript watching
- ✅ Exclude `uploads/` and `node_modules/` folders
- ✅ Restart on changes to `src/` only during development

### TypeScript Compiler
**Current Configuration (tsconfig.json):**
- Enable strict mode for type safety
- Target modern JavaScript (ES2020 or later)
- Set module resolution to `node`

---

## Code Organization Best Practices

### Structure by Feature
```
src/
├── controllers/  # Request handlers
├── services/     # Business logic
├── models/       # Data schemas
├── routes/       # Route definitions
├── middleware/   # Express middleware
├── lib/          # Utilities & configurations
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

### Service Layer Pattern
- Controllers → handle HTTP layer
- Services → handle business logic
- Models → handle database layer
- Never mix these concerns

### Error Handling
- ✅ Create custom error classes extending `Error`
- ✅ Use middleware to catch and format errors
- ✅ Always return consistent error responses
- ✅ Log errors with context for debugging

---

## Security Checklist

- [ ] All environment variables in `.env.local` (not committed)
- [ ] HTTPS enforced in production
- [ ] CORS properly configured for frontend domains
- [ ] JWT tokens validated on protected routes
- [ ] Password hashing with bcrypt (salt rounds ≥10)
- [ ] Input validation on all user-submitted data
- [ ] SQL/NoSQL injection prevention (Mongoose handles this)
- [ ] Rate limiting implemented on payment endpoints
- [ ] Webhook signatures verified (Stripe, Razorpay)
- [ ] Admin routes protected with role middleware (`adminMiddlewere.ts`)

---

## Performance Optimization Notes

### Database
- Index frequently queried fields (emails, product IDs, order IDs)
- Use `.lean()` for read-only queries
- Implement pagination for large result sets
- Use MongoDB aggregation for complex queries

### Caching
- Consider Redis for session storage and cart data
- Cache product listings with TTL
- Implement cache invalidation on product updates

### API Responses
- Implement field projection (select specific fields)
- Use pagination limits
- Compress responses with gzip middleware

### Image Optimization
- Use Cloudinary transformations for responsive images
- Implement WebP format delivery
- Set appropriate cache headers

---

## Testing & Quality (Recommendations)

Currently not configured. Consider adding:
- **Jest** or **Vitest** for unit tests
- **Supertest** for API endpoint testing
- **MongoDB Memory Server** for test database
- **ESLint** for code quality
- **Prettier** for code formatting

---

## Monitoring & Logging (Recommendations)

Consider implementing:
- **Winston** or **Pino** for structured logging
- **Sentry** for error tracking
- **MongoDB Atlas** monitoring for database performance
- **Stripe Dashboard** for payment monitoring

---

## Version Update Recommendations

### Critical Updates
- Keep `mongoose` updated for security patches
- Keep `express` updated (currently at latest v5)
- Keep `stripe` and `razorpay` SDKs updated for new features

### Dependency Health
- Run `npm audit` regularly
- Update TypeScript version quarterly
- Test before updating major versions

---

## Related Documentation

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)
- [Stripe Documentation](https://stripe.com/docs/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
