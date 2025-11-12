# Setup Guide

Follow these steps to get your Pet Platform Backend up and running.

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- dotenv
- bcryptjs
- jsonwebtoken
- cors
- nodemon (dev dependency)

## Step 2: Setup Database

1. **Install MySQL** if you haven't already
2. **Open MySQL Workbench** or your preferred MySQL client
3. **Import the database:**
   - Open the `database.sql` file
   - Execute all the SQL statements to create the database and tables
   - This will also populate sample data

Alternatively, you can run from command line:
```bash
mysql -u root -p < database.sql
```

## Step 3: Configure Environment Variables

1. **Create a `.env` file** in the root directory
2. **Copy the configuration from `env.example`:**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=PetPlatform
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

3. **Update the values** with your actual MySQL credentials

**Important:** Replace `your_mysql_password` with your actual MySQL root password, and generate a strong random string for `JWT_SECRET`.

## Step 4: Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
Connected to MySQL database
Server is running on port 3000
Environment: development
```

## Step 5: Test the API

Open your browser or use Postman/curl to test:

**Health Check:**
```
GET http://localhost:3000/
```

Expected response:
```json
{
  "message": "Pet Platform API is running!",
  "version": "1.0.0"
}
```

**Test Login (with sample data):**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "pass123"
}
```

## Common Issues

### Issue: "Error connecting to database"
**Solution:** 
- Check if MySQL is running
- Verify DB_HOST, DB_USER, DB_PASSWORD in `.env` file
- Make sure PetPlatform database exists

### Issue: "Port 3000 already in use"
**Solution:**
- Change the PORT in `.env` file to a different number (e.g., 3001)
- Or stop the process using port 3000

### Issue: "Module not found"
**Solution:**
- Run `npm install` again
- Make sure you're in the correct directory

### Issue: "JWT token errors"
**Solution:**
- Make sure JWT_SECRET is set in `.env` file
- Don't use spaces in JWT_SECRET

## Next Steps

1. Read the `API_DOCUMENTATION.md` for detailed API endpoints
2. Test all endpoints using Postman or similar tools
3. Set up authentication for protected routes
4. Customize the API according to your needs

## Development Tips

- Use `npm run dev` for development (auto-reload on file changes)
- Check console logs for debugging
- Use Postman or Thunder Client (VS Code extension) to test endpoints
- Keep your `.env` file secure and never commit it to git

## Production Deployment

Before deploying to production:
1. Set `NODE_ENV=production` in `.env`
2. Use a strong, random JWT_SECRET
3. Set up proper MySQL user permissions
4. Use HTTPS
5. Set up proper CORS policies
6. Add rate limiting
7. Set up proper logging
8. Configure database backups

Happy coding! 🚀
