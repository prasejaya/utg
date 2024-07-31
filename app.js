const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');   


// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
app.locals.IMAGES_URL = '/images/';
app.locals.CSS_URL = '/css/';
app.locals.JS_URL = '/js/';
app.locals.PLUGINS_URL = '/plugins/'; // Sesuaikan jika diperlukan

// Set up EJS for templating
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public'))); // Serve static files   

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});