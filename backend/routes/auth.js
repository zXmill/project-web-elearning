const passport = require('passport');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side
const supabase = createClient(supabaseUrl, supabaseKey);

const { JWT_SECRET, FRONTEND_URL } = process.env;

router.post('/register', async (req, res) => {
  try {
    const { email, password, namaLengkap } = req.body;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = No rows found, which is okay here
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('Users')
      .insert({
        email,
        password: hashedPassword,
        namaLengkap,
        role: 'user',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const { data: user, error: fetchError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google OAuth routes would need to be adapted similarly, possibly using Supabase Auth or custom logic

module.exports = router;
