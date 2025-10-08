// api/recharge/request.js
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
    const { amount } = JSON.parse(event.body);
    const userId = 'user_id_from_token'; // This would come from the JWT token in a real implementation

    // Validation
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount is required and must be greater than 0' }),
      };
    }

    // Create recharge request
    const { data: newRecharge, error: rechargeError } = await supabase
      .from('recharges')
      .insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (rechargeError) {
      throw rechargeError;
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
        message: 'Recharge request created successfully', 
        recharge: newRecharge 
      }),
    };
  } catch (error) {
    console.error('Recharge request error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};