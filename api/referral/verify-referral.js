// api/referral/verify-referral.js
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ACCES_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const token = event.headers.authorization?.split(' ')[1];
  
  try {
    const { referral_code } = JSON.parse(event.body);
    const userId = 'user_id_from_token'; // This would come from the JWT token in a real implementation

    if (!referral_code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Referral code is required' }),
      };
    }

    // Check if referral code exists and is valid
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', referral_code)
      .single();

    if (referrerError || !referrer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid referral code' }),
      };
    }

    // Check if the referrer is not the same as the current user (no self-referral)
    if (referrer.id === userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cannot use your own referral code' }),
      };
    }

    // Check if user already has a referred_by value (to prevent changing referral after initial referral)
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', userId)
      .single();

    if (userError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    if (currentUser.referred_by) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'You have already used a referral code' }),
      };
    }

    // Update the user's referred_by field
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ referred_by: referrer.id })
      .eq('id', userId);

    if (updateUserError) {
      throw updateUserError;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        message: 'Referral code applied successfully',
        referrer: {
          id: referrer.id,
          name: referrer.name,
          username: referrer.username
        }
      }),
    };
  } catch (error) {
    console.error('Referral verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};