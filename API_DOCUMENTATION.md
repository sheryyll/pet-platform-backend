# Pet Platform API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the request header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
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

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "Owner"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_type": "Owner",
    "rating": 0.0
  }
}
```

---

## 2. Location Endpoints

### Get All Locations
**GET** `/locations`

**Response:** `200 OK`
```json
[
  {
    "location_id": 1,
    "area": "Koramangala",
    "city": "Bangalore",
    "pincode": "560095"
  }
]
```

### Get Location by ID
**GET** `/locations/:id`

### Create Location
**POST** `/locations`

**Request Body:**
```json
{
  "area": "Koramangala",
  "city": "Bangalore",
  "pincode": "560095"
}
```

### Update Location
**PUT** `/locations/:id`

### Delete Location
**DELETE** `/locations/:id`

---

## 3. User Endpoints

### Get All Users
**GET** `/users`

**Response:** `200 OK`
```json
[
  {
    "user_id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "9876543210",
    "user_type": "Owner",
    "address": "123, Koramangala",
    "location_id": 1,
    "rating": 4.8,
    "area": "Koramangala",
    "city": "Bangalore",
    "pincode": "560095"
  }
]
```

### Get User by ID
**GET** `/users/:id`

### Update User
**PUT** `/users/:id`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "456 Main Street",
  "location_id": 1,
  "user_type": "Both"
}
```

### Delete User
**DELETE** `/users/:id`

---

## 4. Pet Endpoints

### Get All Pets
**GET** `/pets`

**Response:** `200 OK`
```json
[
  {
    "pet_id": 1,
    "owner_id": 1,
    "pet_name": "Buddy",
    "species": "Dog",
    "breed": "Golden Retriever",
    "age": 3,
    "gender": "Male",
    "vaccinated": "Y",
    "status": "Available",
    "owner_name": "Alice Johnson",
    "owner_email": "alice@example.com"
  }
]
```

### Get Pet by ID
**GET** `/pets/:id`

### Get Pets by Owner
**GET** `/pets/owner/:ownerId`

### Create Pet
**POST** `/pets`

**Request Body:**
```json
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

**Species options:** `Dog`, `Cat`, `Rabbit`, `Bird`, `Other`
**Gender options:** `Male`, `Female`
**Vaccinated options:** `Y`, `N`
**Status options:** `Available`, `Adopted`, `Being_Sat`

### Update Pet
**PUT** `/pets/:id`

### Delete Pet
**DELETE** `/pets/:id`

---

## 5. Adoption Request Endpoints

### Get All Adoption Requests
**GET** `/adoptions`

**Response:** `200 OK`
```json
[
  {
    "adoption_id": 1,
    "pet_id": 1,
    "adopter_id": 3,
    "request_date": "2025-10-10",
    "status": "Approved",
    "pet_name": "Buddy",
    "species": "Dog",
    "adopter_name": "Charlie Smith",
    "adopter_email": "charlie@example.com"
  }
]
```

### Get Adoption Request by ID
**GET** `/adoptions/:id`

### Create Adoption Request
**POST** `/adoptions`

**Request Body:**
```json
{
  "pet_id": 1,
  "adopter_id": 3,
  "request_date": "2025-10-10",
  "status": "Pending"
}
```

**Status options:** `Pending`, `Approved`, `Rejected`

### Update Adoption Request
**PUT** `/adoptions/:id`

**Request Body:**
```json
{
  "status": "Approved"
}
```

*Note: When status is changed to "Approved", the pet's status is automatically updated to "Adopted".*

### Delete Adoption Request
**DELETE** `/adoptions/:id`

---

## 6. Sitting Request Endpoints

### Get All Sitting Requests
**GET** `/sittings`

**Response:** `200 OK`
```json
[
  {
    "sitting_id": 1,
    "owner_id": 1,
    "sitter_id": 2,
    "pet_id": 3,
    "start_date": "2025-10-01",
    "end_date": "2025-10-05",
    "total_cost": 2500.00,
    "status": "Completed",
    "pet_name": "Coco",
    "species": "Rabbit",
    "owner_name": "Alice Johnson",
    "owner_email": "alice@example.com",
    "sitter_name": "Bob Williams",
    "sitter_email": "bob@example.com"
  }
]
```

### Get Sitting Request by ID
**GET** `/sittings/:id`

### Create Sitting Request
**POST** `/sittings`

**Request Body:**
```json
{
  "owner_id": 1,
  "sitter_id": 2,
  "pet_id": 3,
  "start_date": "2025-10-01",
  "end_date": "2025-10-05",
  "total_cost": 2500.00,
  "status": "Pending"
}
```

**Status options:** `Pending`, `Accepted`, `Completed`, `Cancelled`

### Update Sitting Request
**PUT** `/sittings/:id`

*Note: When status is changed to "Accepted", pet status is updated to "Being_Sat". When status is "Completed" or "Cancelled", pet status returns to "Available".*

### Delete Sitting Request
**DELETE** `/sittings/:id`

---

## 7. Booking Endpoints

### Get All Bookings
**GET** `/bookings`

**Response:** `200 OK`
```json
[
  {
    "booking_id": 1,
    "request_type": "Adoption",
    "request_id": 1,
    "date_created": "2025-10-10T10:00:00.000Z",
    "status": "Completed"
  }
]
```

### Get Booking by ID
**GET** `/bookings/:id`

### Create Booking
**POST** `/bookings`

**Request Body:**
```json
{
  "request_type": "Adoption",
  "request_id": 1,
  "status": "Confirmed"
}
```

**Request Type options:** `Adoption`, `Sitting`
**Status options:** `Confirmed`, `Completed`, `Cancelled`

### Update Booking
**PUT** `/bookings/:id`

### Delete Booking
**DELETE** `/bookings/:id`

---

## 8. Payment Endpoints

### Get All Payments
**GET** `/payments`

**Response:** `200 OK`
```json
[
  {
    "payment_id": 1,
    "booking_id": 1,
    "amount": 0.00,
    "payment_method": "Cash",
    "payment_date": "2025-10-10T12:00:00.000Z",
    "payment_status": "Paid",
    "request_type": "Adoption",
    "booking_status": "Completed"
  }
]
```

### Get Payment by ID
**GET** `/payments/:id`

### Create Payment
**POST** `/payments`

**Request Body:**
```json
{
  "booking_id": 1,
  "amount": 2500.00,
  "payment_method": "UPI",
  "payment_status": "Paid"
}
```

**Payment Method options:** `CreditCard`, `UPI`, `NetBanking`, `Cash`
**Payment Status options:** `Paid`, `Failed`, `Pending`

### Update Payment
**PUT** `/payments/:id`

### Delete Payment
**DELETE** `/payments/:id`

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "User already exists with this email"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error fetching users",
  "error": "Error details..."
}
```

---

## Quick Start Example

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "password": "password123",
    "user_type": "Owner",
    "address": "123 Main St",
    "location_id": 1
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

### 3. Get all pets (with authentication)
```bash
curl -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Create a pet
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "owner_id": 1,
    "pet_name": "Max",
    "species": "Dog",
    "breed": "Labrador",
    "age": 2,
    "gender": "Male",
    "vaccinated": "Y",
    "status": "Available"
  }'
```

---

## Notes

- All timestamps are in UTC
- Date fields use format: `YYYY-MM-DD`
- DateTime fields use format: `YYYY-MM-DD HH:MM:SS`
- Password should be at least 8 characters (best practice)
- JWT tokens expire after 7 days
- Use HTTPS in production
- Remember to hash passwords in production (already implemented with bcrypt)
