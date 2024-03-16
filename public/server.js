const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Add this line

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

const uri = 'mongodb+srv://commonuser:commonuser@cluster0.rbl8u1d.mongodb.net/auth?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // POST route for registering a new user
    app.post('/register', async (req, res) => {
      const { fullName, email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      try {
        // Remove the confirmPassword field from the request body
        delete req.body.confirmPassword;

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();
        console.log('User registered:',newUser);
        res.status(201).json({ message: 'User registered successfully' });
      } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // POST route for logging in a user
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
    
      console.log('Email:', email);
      console.log('Password:', password);
    
      try {
        const user = await User.findOne({ email });
        if (!user) {
          console.log('User not found');
          return res.status(404).json({ error: 'User not found' });
        }
    
        console.log('User found:', user);
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log('Invalid credentials');
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        console.log('Login successful:', user);
    
        // Send redirect response to client
        res.redirect('/index.html');
    
      } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
      
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

run().catch(console.dir);
