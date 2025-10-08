// api/auth/login.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ACCES_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { phone_number, password } = JSON.parse(event.body);

    // Validation
    if (!phone_number || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number and password are required' }),
      };
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid phone number or password' }),
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Account is deactivated' }),
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid phone number or password' }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone_number: user.phone_number, 
        is_admin: user.is_admin 
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response (without password hash)
    const { password_hash, ...userWithoutPassword } = user;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        message: 'Login successful', 
        token,
        user: userWithoutPassword
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};