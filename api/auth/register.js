// api/auth/register.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
    const { name, username, phone_number, password, confirm_password, referral_code } = JSON.parse(event.body);

    // Validation
    if (!name || !username || !phone_number || !password || !confirm_password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    if (password !== confirm_password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Passwords do not match' }),
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password must be at least 6 characters long' }),
      };
    }

    // Check if phone number or username already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .or(`phone_number.eq.${phone_number},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.phone_number === phone_number) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Phone number already registered' }),
        };
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Username already taken' }),
        };
      }
    }

    // Handle referral
    let referred_by = null;
    if (referral_code) {
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referral_code)
        .single();

      if (referrer) {
        referred_by = referrer.id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate referral code
    const referralCode = `${username.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          username,
          phone_number,
          password_hash: passwordHash,
          referral_code: referralCode,
          referred_by,
          balance: 0,
          total_invested: 0,
          total_withdrawn: 0,
          is_active: true
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Return success response (without password hash)
    const { password_hash, ...userWithoutPassword } = newUser;
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        message: 'User registered successfully', 
        user: userWithoutPassword 
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};