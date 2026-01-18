# Project Drive - Cloud Storage Application

A full-stack web application built with Node.js, Express, MongoDB, and Firebase Storage that allows users to register, login, upload files to the cloud, and download them securely.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **File Upload**: Upload files to Firebase Cloud Storage
- **File Management**: View all uploaded files
- **Secure Download**: Download files with signed URLs (15-minute expiry)
- **Session Management**: Cookie-based authentication
- **Password Security**: Bcrypt password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Firebase Account
- npm or yarn

## 🛠️ Step-by-Step Build Process

### Step 1: Project Initialization

1. **Created project directory**:

   ```bash
   mkdir Project_Drive
   cd Project_Drive
   ```

2. **Initialized Node.js project**:
   ```bash
   npm init -y
   ```

### Step 2: Installed Dependencies

Installed all required npm packages:

```bash
npm install express mongoose ejs bcrypt jsonwebtoken cookie-parser dotenv express-validator multer firebase-admin multer-firebase-storage
```

**Dependencies breakdown**:

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `ejs` - Template engine
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cookie-parser` - Parse cookies
- `dotenv` - Environment variables
- `express-validator` - Input validation
- `multer` - File upload handling
- `firebase-admin` - Firebase SDK
- `multer-firebase-storage` - Firebase storage integration

### Step 3: Created Project Structure

Created the following folder structure:

```
Project_Drive/
├── config/
├── middlewares/
├── models/
├── public/
├── routes/
└── views/
```

### Step 4: Set Up Firebase

1. **Created Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Generated service account key**:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Downloaded JSON file as `drive-2244e-firebase-adminsdk-fbsvc-d4a3b61234.json`
3. **Enabled Firebase Storage** in Firebase Console

### Step 5: Created Configuration Files

#### 5.1 Database Configuration (`config/db.js`)

```javascript
const mongoose = require("mongoose");

function connectToDB() {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("connected to mongoDB Successfully.");
  });
}

module.exports = connectToDB;
```

#### 5.2 Firebase Configuration (`config/firebase.config.js`)

```javascript
const Firebase = require("firebase-admin");
const serviceAccount = require("../drive-2244e-firebase-adminsdk-fbsvc-d4a3b61234.json");
const firebase = Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccount),
  storageBucket: "drive-2244e.appspot.com",
});
module.exports = Firebase;
```

#### 5.3 Multer Configuration (`config/multer.config.js`)

```javascript
const multer = require("multer");
const firebaseStorage = require("multer-firebase-storage");
const firebase = require("./firebase.config");
const serviceAccount = require("../drive-2244e-firebase-adminsdk-fbsvc-d4a3b61234.json");

const storage = firebaseStorage({
  credentials: firebase.credential.cert(serviceAccount),
  bucketName: "drive-2244e.appspot.com",
  unique: true,
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
```

### Step 6: Created Data Models

#### 6.1 User Model (`models/user.model.js`)

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength: [3, "username must be at least 3 characters long"],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength: [12, "email must be at least 12 characters long"],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, "password must be at least 6 characters long"],
  },
});

const user = mongoose.model("user", userSchema);
module.exports = user;
```

#### 6.2 File Model (`models/file.model.js`)

```javascript
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, "File path is required"],
  },
  originalName: {
    type: String,
    required: [true, "Original file name is required"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "User reference is required"],
  },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
```

### Step 7: Created Authentication Middleware

Created `middlewares/auth.js` for JWT verification:

```javascript
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Access Denied.Unauthorized" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    return next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
```

### Step 8: Created Routes

#### 8.1 User Routes (`routes/user.routes.js`)

Implemented:

- `GET /user/register` - Render registration page
- `POST /user/register` - Handle user registration with validation
- `GET /user/login` - Render login page
- `POST /user/login` - Handle user login and JWT generation
- `GET /user/logout` - Clear cookie and logout

#### 8.2 Index Routes (`routes/index.router.js`)

Implemented:

- `GET /home` - Display user's uploaded files
- `POST /upload` - Upload file to Firebase Storage
- `GET /download/:path` - Generate signed URL and download file

### Step 9: Created Views (EJS Templates)

#### 9.1 Registration Page (`views/register.ejs`)

- Form with username, email, and password fields
- Styled with `public/register.css`

#### 9.2 Login Page (`views/login.ejs`)

- Form with email and password fields
- Styled with `public/login.css`

#### 9.3 File Upload Page (`views/fileupload.ejs`)

- File upload form
- Display list of uploaded files
- Download links for each file
- Styled with `public/fileupload.css`

### Step 10: Created Main Application File

Created `app.js`:

```javascript
const express = require("express");
const app = express();
const userRouter = require("./routes/user.routes.js");
const indexRouter = require("./routes/index.router.js");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db.js");
connectToDB();
const cookieParser = require("cookie-parser");
const PORT = 3000;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/user", userRouter);

app.listen(PORT, (req, res) => {
  console.log(`app is listening on PORT: ${PORT}.`);
});
```

### Step 11: Created Environment Variables

Created `.env` file (not committed to Git):

```env
MONGO_URI=mongodb://localhost:27017/project_drive
JWT_SECRET=your_jwt_secret_key_here
```

### Step 12: Created CSS Styling

Created three CSS files in `public/` folder:

- `login.css` - Login page styling
- `register.css` - Registration page styling
- `fileupload.css` - File upload and management page styling

### Step 13: Testing and Debugging

1. Started MongoDB server
2. Ran the application: `node app.js`
3. Tested all routes:
   - User registration
   - User login
   - File upload
   - File listing
   - File download
   - User logout

## 📦 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd Project_Drive
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project
   - Enable Firebase Storage
   - Download service account key JSON file
   - Place it in the root directory

4. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `project_drive`

5. **Create `.env` file**:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

6. **Update Firebase credentials**:
   - Update the service account filename in configuration files if different
   - Update the storage bucket name in firebase.config.js

## 🚀 Running the Application

1. **Start MongoDB** (if running locally):

   ```bash
   mongod
   ```

2. **Start the application**:

   ```bash
   node app.js
   ```

3. **Access the application**:
   - Open browser and navigate to `http://localhost:3000`
   - Register a new user at `http://localhost:3000/user/register`
   - Login at `http://localhost:3000/user/login`

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds of 10
- **JWT Authentication**: Secure token-based authentication
- **Cookie-based Sessions**: HTTP-only cookies for storing JWT
- **Input Validation**: Express-validator for request validation
- **Signed URLs**: Time-limited (15 minutes) signed URLs for file downloads
- **Protected Routes**: Authentication middleware for secured endpoints

## 📁 Project Structure

```
Project_Drive/
├── app.js                          # Main application entry point
├── package.json                    # Project dependencies
├── .env                           # Environment variables (not in git)
├── drive-2244e-firebase-*.json    # Firebase service account (not in git)
├── config/
│   ├── db.js                      # MongoDB connection
│   ├── firebase.config.js         # Firebase initialization
│   └── multer.config.js           # Multer + Firebase storage config
├── middlewares/
│   └── auth.js                    # JWT authentication middleware
├── models/
│   ├── user.model.js              # User schema
│   └── file.model.js              # File schema
├── routes/
│   ├── user.routes.js             # User authentication routes
│   └── index.router.js            # File management routes
├── views/
│   ├── register.ejs               # Registration page
│   ├── login.ejs                  # Login page
│   └── fileupload.ejs             # File upload/management page
└── public/
    ├── register.css               # Registration page styles
    ├── login.css                  # Login page styles
    └── fileupload.css             # File upload page styles
```

## 🌟 Key Learnings

1. **Authentication Flow**: Implemented complete user authentication with JWT
2. **File Upload**: Integrated Multer with Firebase Storage
3. **Database Relations**: Created relationships between User and File models
4. **Middleware**: Built custom authentication middleware
5. **Security**: Implemented password hashing and signed URLs
6. **Validation**: Used express-validator for input validation
7. **MVC Pattern**: Organized code with Model-View-Controller pattern
8. **Environment Variables**: Managed sensitive data with dotenv

## 🔧 API Endpoints

### Authentication

- `GET /user/register` - Registration page
- `POST /user/register` - Create new user
- `GET /user/login` - Login page
- `POST /user/login` - Authenticate user
- `GET /user/logout` - Logout user

### File Management

- `GET /home` - View uploaded files (protected)
- `POST /upload` - Upload new file (protected)
- `GET /download/:path` - Download file (protected)

## 🐛 Troubleshooting

- **MongoDB connection error**: Ensure MongoDB is running and MONGO_URI is correct
- **Firebase error**: Verify service account JSON file and bucket name
- **JWT error**: Check JWT_SECRET in .env file
- **File upload fails**: Verify Firebase Storage rules and permissions

## 📝 Future Enhancements

- [ ] File deletion functionality
- [ ] File sharing between users
- [ ] Folder organization
- [ ] File preview
- [ ] Search functionality
- [ ] File size limits
- [ ] User profile management
- [ ] Password reset functionality
- [ ] Email verification

## 👨‍💻 Author

Built as a Third Year (TY) academic project.

## 📄 License

This project is for educational purposes.

---

**Note**: Remember to never commit sensitive files like `.env` and Firebase service account JSON to version control. Add them to `.gitignore`.
