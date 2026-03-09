# MySQL Setup for Windows

## 🪟️ Option 1: XAMPP (Recommended for Development)

### 1. Download and Install XAMPP
- Visit: https://www.apachefriends.org/download.html
- Download XAMPP for Windows
- Run the installer with default settings
- Start MySQL from XAMPP control panel

### 2. Configure MySQL
- Open XAMPP Control Panel
- Click on MySQL → Config
- Set root password (remember it for .env file)
- Note the port (usually 3307)
- Start/Stop MySQL as needed

### 3. Update .env
```bash
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=microfinance_system
```

---

## 🪟️ Option 2: MySQL Server (Production)

### 1. Download MySQL Server
- Visit: https://dev.mysql.com/downloads/mysql/
- Download MySQL Community Server
- Run the installer
- Choose "Developer Default" or "Server Only"
- Set root password during installation
- Include MySQL Command Line Tools

### 2. Configure MySQL
- Open MySQL Command Line Client
- Create database:
```sql
CREATE DATABASE microfinance_system;
```
- Create user (optional):
```sql
CREATE USER 'microfinance'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON microfinance_system.* TO 'microfinance'@'localhost;
FLUSH PRIVILEGES;
```

### 3. Update .env
```bash
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=microfinance_system
```

---

## 🪟️ Option 3: Docker (Advanced)

### 1. Install Docker Desktop
- Download Docker Desktop from: https://www.docker.com/products/docker-desktop/

### 2. Run MySQL Container
```bash
docker run --name mysql -e MYSQL_ROOT_PASSWORD=your_password -p 3306:3306 -d mysql:8.0

# Or with persistent data
docker run --name mysql -e MYSQL_ROOT_PASSWORD=your_password -p 3306:3306 -v mysql_data:/var/lib/mysql -d mysql:8.0
```

### 3. Update .env
```bash
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=microfinance_system
```

---

## 🔧 Common Windows Issues

### MySQL Service Not Found
```bash
# Check if MySQL is running
net start mysql

# Or start from XAMPP Control Panel
```

### Access Denied
```bash
# Reset MySQL root password
# Stop MySQL service
# Run MySQL with --skip-grant-tables
# Reset password with: ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
```

### Port 3307 Already in Use
```bash
# Check what's using port 3307
netstat -ano | findstr :3307

# Kill the process if needed
taskkill /PID <PID> /F
```

### Connection Timeout
```bash
# Check MySQL service status
net start mysql

# Or restart XAMPP MySQL
```

---

## 🎯 Quick Test

After setup, test connection:
```bash
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).then(() => {
  console.log('✅ Database connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"
```

---

## 📋 Next Steps

1. Update your .env file with the correct database credentials
2. Run: `npm run setup-db`
3. Run: `npm run seed`
4. Start the server: `npm start`

## 🔧 Troubleshooting

### "Access denied for user 'root'@'localhost'"
- MySQL 8.0+ requires explicit user creation
- Create user and grant permissions
- Or use `--skip-grant-tables` flag

### "Can't connect to MySQL server"
- Check if MySQL service is running
- Verify port 3307 is available
- Check firewall settings
- Verify credentials in .env file

### "Database not found"
- Create the database manually:
  ```sql
  CREATE DATABASE microfinance_system;
  ```
- Or run the setup script again

---

💡 **Tip**: For development, XAMPP is the easiest option as it includes MySQL, Apache, and PHP all in one package with a nice control panel!
