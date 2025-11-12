# Pet Platform Backend API

A comprehensive Node.js RESTful API for managing pet adoptions, pet sitting, bookings, payments, and reviews.

## Features

- **User Management**: Registration, login, and profile management with JWT authentication
- **Pet Management**: CRUD operations for pets with status tracking
- **Adoption System**: Request and manage pet adoptions
- **Pet Sitting**: Create and manage pet sitting requests
- **Bookings**: Track adoption and sitting bookings
- **Payments**: Handle payment processing for bookings
- **Reviews**: User reviews and ratings system
- **Location Management**: Location-based services

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- MySQL Workbench or similar database management tool

## Installation

1. **Clone the repository**
   ```bash
   cd pet-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create the database using the SQL script provided
   - Open MySQL Workbench and execute the SQL script to create tables and sample data

4. **Configure environment variables**
   - Copy `env.example` to `.env`
   - Update the database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=PetPlatform
   PORT=3000
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/:id` - Get pet by ID
- `GET /api/pets/owner/:ownerId` - Get pets by owner
- `POST /api/pets` - Create pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Adoption Requests
- `GET /api/adoptions` - Get all adoption requests
- `GET /api/adoptions/:id` - Get adoption request by ID
- `POST /api/adoptions` - Create adoption request
- `PUT /api/adoptions/:id` - Update adoption request
- `DELETE /api/adoptions/:id` - Delete adoption request

### Sitting Requests
- `GET /api/sittings` - Get all sitting requests
- `GET /api/sittings/:id` - Get sitting request by ID
- `POST /api/sittings` - Create sitting request
- `PUT /api/sittings/:id` - Update sitting request
- `DELETE /api/sittings/:id` - Delete sitting request

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Database Schema

The API supports the following main entities:
- **User**: Pet owners, sitters, or both
- **Location**: Geographic locations
- **Pet**: Pet information and status
- **AdoptionRequest**: Pet adoption requests
- **SittingRequest**: Pet sitting requests
- **Booking**: Booking records
- **Payment**: Payment transactions
- **Review**: User reviews and ratings

## Authentication

Most endpoints support JWT token authentication. Include the token in the request header:
```
Authorization: Bearer <your_jwt_token>
```

## Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securePassword123",
  "user_type": "Owner",
  "address": "123 Main Street",
  "location_id": 1
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Create Pet
```bash
POST /api/pets
Content-Type: application/json
Authorization: Bearer <token>

{
  "owner_id": 1,
  "pet_name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": 3,
  "gender": "Male",
  "vaccinated": "Y",
  "status": "Available"
}
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Environment**: dotenv for configuration

## Error Handling

The API follows standard HTTP status codes:
- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

## Development

The project uses nodemon for development auto-reloading. Start the development server with:
```bash
npm run dev
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
