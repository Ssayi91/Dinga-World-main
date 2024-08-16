const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
const port = 3000;

// MongoDB Atlas connection string
const mongoDBUri = 'mongodb+srv://sonnysayi:xX33h5qEhrskQIRC@dingaworld.pmg8k.mongodb.net/?retryWrites=true&w=majority&appName=Dingaworld';

// Connect to MongoDB
mongoose.connect(mongoDBUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const carSchema = new mongoose.Schema({
    carBrand: String,
    carModel: String,
    carYear: Number,
    carPrice: Number,
    transmission: String,
    carPhotos: [String], // Array of photo URLs
    approved: { type: Boolean, default: false }
});

const Car = mongoose.model('Car', carSchema);

const quoteSchema = new mongoose.Schema({
    carId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String,
    timestamp: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., HTML, CSS, JS) from the "publics" directory
app.use(express.static('publics'));

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

// Route to submit car details
app.post('/submit-car-details', upload.array('carPhotos', 12), async (req, res) => {
    const details = req.body;
    const files = req.files;

    const fullDetails = {
        ...details,
        carPhotos: files.map(file => '/uploads/' + file.filename),
        approved: false
    };

    try {
        const car = new Car(fullDetails);
        await car.save();
        res.json({ message: 'Car details submitted successfully', formDetails: fullDetails });
    } catch (err) {
        res.status(500).json({ message: 'Error saving car details', error: err });
    }
});

// Route to fetch car details for the admin dashboard
app.get('/admin-dashboard', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching car details', error: err });
    }
});

// Route to fetch approved car details for the frontend
app.get('/approved-cars', async (req, res) => {
    try {
        const approvedCars = await Car.find({ approved: true });
        res.json(approvedCars);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching approved cars', error: err });
    }
});

// Route to approve a car detail
app.post('/approve-car', async (req, res) => {
    const { carId } = req.body;
    try {
        const car = await Car.findById(carId);
        if (car) {
            car.approved = true;
            await car.save();
            res.json({ message: 'Car approved' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error approving car', error: err });
    }
});

// Route to submit a quote request
app.post('/submit-quote', async (req, res) => {
    const { carId, name, email, phone } = req.body;

    try {
        const newQuote = new Quote({ carId, name, email, phone });
        await newQuote.save();
        res.status(200).json({ message: 'Quote request submitted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting quote request', error: err });
    }
});

// Route to get quotes
app.get('/get-quotes', async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching quotes', error: err });
    }
});

// Route to search for cars based on query parameters
app.get('/api/search', async (req, res) => {
    const { brand, model, transmission, minYear, maxYear, minPrice, maxPrice } = req.query;

    try {
        const results = await Car.find({
            $and: [
                { carBrand: { $regex: brand, $options: 'i' } },
                { carModel: { $regex: model, $options: 'i' } },
                { transmission: { $regex: transmission, $options: 'i' } },
                { carYear: { $gte: minYear || 0, $lte: maxYear || Infinity } },
                { carPrice: { $gte: minPrice || 0, $lte: maxPrice || Infinity } }
            ]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error searching for cars', error: err });
    }
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
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://192.168.1.100:${port}`);
});
