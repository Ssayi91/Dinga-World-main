const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');



const mongoURI = process.env.MONGO_URI; // Make sure this is set correctly

if (!mongoURI) {
  console.error('MongoDB URI not defined!');
  process.exit(1);
}

    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
const port = 3000;

// Initialize quotes array
const quotes = [];

// Middleware for parsing form data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., HTML, CSS, JS) from the "publics" directory
app.use(express.static(path.join((__dirname, 'publics'))));

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Temporary store for submitted details
const submittedDetails = [];

// Route to submit car details
app.post('/submit-car-details', upload.array('carPhotos', 12), (req, res) => {
    const details = req.body;
    const files = req.files;

    // Combine form data with file paths
    const fullDetails = {
        ...details,
        carPhotos: files.map(file => '/uploads/' + file.filename), // Include file paths
        approved: false // Initialize as not approved
    };

    submittedDetails.push(fullDetails); // Save combined details for admin review
    res.json({ 
        message: 'Car details submitted successfully', 
        formDetails: fullDetails 
    });
});

// Route to fetch car details for the admin dashboard
app.get('/admin-dashboard', (req, res) => {
    res.json(submittedDetails); // Send all submitted details to the admin dashboard
});

// Route to fetch approved car details for the frontend
app.get('/approved-cars', (req, res) => {
    const approvedCars = submittedDetails.filter(detail => detail.approved);
    res.json(approvedCars); // Send only approved car details
});

// Route to approve a car detail
app.post('/approve-car', (req, res) => {
    const { carName } = req.body;
    // Find the car by carName
    const car = submittedDetails.find(detail => `${detail.carBrand} ${detail.carModel}` === carName);

    if (car) {
        // Mark the car as approved
        car.approved = true;
        res.json({ message: `Car ${carName} approved` });
    } else {
        res.status(404).json({ message: 'Car not found' });
    }
});

// Route to search for cars based on query parameters
app.get('/api/search', (req, res) => {
    const { brand, model, transmission, minYear, maxYear, minPrice, maxPrice } = req.query;

    // Create a dynamic query object
    const query = {};

    if (brand) {
        query.carBrand = { $regex: brand, $options: 'i' }; // Case-insensitive search
    }
    if (model) {
        query.carModel = { $regex: model, $options: 'i' };
    }
    if (transmission) {
        query.transmission = { $regex: transmission, $options: 'i' };
    }
    if (minYear || maxYear) {
        query.carYear = {};
        if (minYear) query.carYear.$gte = minYear;
        if (maxYear) query.carYear.$lte = maxYear;
    }
    if (minPrice || maxPrice) {
        query.carPrice = {};
        if (minPrice) query.carPrice.$gte = minPrice;
        if (maxPrice) query.carPrice.$lte = maxPrice;
    }

    // Filter the submittedDetails array based on the query object
    const results = submittedDetails.filter(car => {
        for (let key in query) {
            if (typeof query[key] === 'object' && '$regex' in query[key]) {
                // Handle regex matching for strings
                const regex = new RegExp(query[key].$regex, query[key].$options);
                if (!regex.test(car[key])) {
                    return false;
                }
            } else if (typeof query[key] === 'object') {
                // Handle numeric range filtering
                if ((query[key].$gte && car[key] < query[key].$gte) ||
                    (query[key].$lte && car[key] > query[key].$lte)) {
                    return false;
                }
            } else if (car[key] !== query[key]) {
                return false;
            }
        }
        return true;
    });

    res.json(results);
});


// Route to submit a quote request
app.post('/submit-quote', (req, res) => {
    const { carId, name, email, phone } = req.body;

    // Store the quote with a timestamp
    quotes.push({ carId, name, email, phone, timestamp: new Date() });

    res.status(200).json({ message: 'Quote request submitted successfully!' });
});

// Route to fetch quotes for the admin page
app.get('/get-quotes', (req, res) => {
    res.json(quotes); // Send all quotes to the admin page
});

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'publics', 'index.html'));
});

// Route to serve the admin.html file
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'publics', 'admin.html'));
});

// Error handling for unsupported routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://192.168.1.100:${port}`);
});
