// api/products/daily-profit.js
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

  try {
    // This endpoint would typically be called by a scheduled function/cron job
    // For demonstration, we'll process all active investments
    
    // Get all active investments that haven't been processed today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: activeInvestments, error } = await supabase
      .from('user_products')
      .select(`
        *,
        user:users(id, balance)
      `)
      .eq('status', 'active')
      .lt('purchase_date', `${today}T23:59:59Z`)  // Only investments that started before today
      .lt('end_date', `${today}T23:59:59Z`);      // Only investments that end after today (still active)

    if (error) {
      console.error('Error fetching active investments:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }

    // Process each active investment
    for (const investment of activeInvestments) {
      // Check if we already processed profit for today
      const { data: todayTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference_id', investment.id)
        .eq('type', 'daily_income')
        .gte('created_at', `${today}T00:00:00Z`)
        .lte('created_at', `${today}T23:59:59Z`)
        .single();

      if (!todayTransaction) {
        // Add daily income to user balance
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ 
            balance: investment.user.balance + investment.daily_income 
          })
          .eq('id', investment.user.id);

        if (userUpdateError) {
          console.error('Error updating user balance:', userUpdateError);
          continue; // Skip to next investment
        }

        // Add transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: investment.user.id,
              type: 'daily_income',
              amount: investment.daily_income,
              status: 'completed',
              description: `Daily income from ${investment.product_id} investment`,
              reference_id: investment.id
            }
          ]);

        if (transactionError) {
          console.error('Error adding transaction:', transactionError);
        }
      }
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
        message: `Processed daily profit for ${activeInvestments.length} investments`
      }),
    };
  } catch (error) {
    console.error('Daily profit calculation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};