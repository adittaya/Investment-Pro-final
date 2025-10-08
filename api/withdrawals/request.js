// api/withdrawals/request.js
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
    const { amount, method, bank_name, ifsc_code, account_number, account_holder_name, upi_id } = JSON.parse(event.body);
    const userId = 'user_id_from_token'; // This would come from the JWT token in a real implementation

    // Validation
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount is required and must be greater than 0' }),
      };
    }

    if (!method || !['bank', 'upi'].includes(method)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Method must be either "bank" or "upi"' }),
      };
    }

    if (method === 'bank' && (!bank_name || !ifsc_code || !account_number || !account_holder_name)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bank details are required for bank withdrawal' }),
      };
    }

    if (method === 'upi' && !upi_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'UPI ID is required for UPI withdrawal' }),
      };
    }

    // Check if user has enough balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    if (user.balance < amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Insufficient balance' }),
      };
    }

    if (amount < 100) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Minimum withdrawal amount is ₹100' }),
      };
    }

    // Check if user has already made a withdrawal in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentWithdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .neq('status', 'rejected')
      .single();

    if (recentWithdrawal) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'You can only make one withdrawal every 24 hours' }),
      };
    }

    // Insert withdrawal request
    const { data: newWithdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          amount,
          method,
          bank_name: method === 'bank' ? bank_name : null,
          ifsc_code: method === 'bank' ? ifsc_code : null,
          account_number: method === 'bank' ? account_number : null,
          account_holder_name: method === 'bank' ? account_holder_name : null,
          upi_id: method === 'upi' ? upi_id : null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (withdrawalError) {
      throw withdrawalError;
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
        message: 'Withdrawal request submitted successfully', 
        withdrawal: newWithdrawal 
      }),
    };
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};