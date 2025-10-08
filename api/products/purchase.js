// api/products/purchase.js
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
  
  // In a real implementation, you would verify the JWT token here
  // For this example, we'll assume the user is authenticated
  
  try {
    const { product_id } = JSON.parse(event.body);
    const userId = 'user_id_from_token'; // This would come from the JWT token in a real implementation

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    // Get user details
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

    // Check if user has enough balance
    if (user.balance < product.price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Insufficient balance' }),
      };
    }

    // Check if user has already purchased this product in the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: existingPurchase, error: purchaseCheckError } = await supabase
      .from('user_products')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .gte('purchase_date', startOfMonth.toISOString())
      .lte('purchase_date', endOfMonth.toISOString());

    if (existingPurchase && existingPurchase.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'You can only buy this product once per month' }),
      };
    }

    // Calculate end date
    const purchaseDate = new Date();
    const endDate = new Date(purchaseDate);
    endDate.setDate(purchaseDate.getDate() + product.duration);

    // Begin transaction - update user balance, insert user product, add transaction
    const { data: updatedUser, error: userUpdateError } = await supabase
      .from('users')
      .update({ 
        balance: user.balance - product.price, 
        total_invested: user.total_invested + product.price 
      })
      .eq('id', userId)
      .select()
      .single();

    if (userUpdateError) {
      throw userUpdateError;
    }

    // Insert user product
    const { data: newUserProduct, error: productInsertError } = await supabase
      .from('user_products')
      .insert([
        {
          user_id: userId,
          product_id: product_id,
          purchase_date: purchaseDate.toISOString(),
          end_date: endDate.toISOString(),
          daily_income: product.daily_income,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (productInsertError) {
      throw productInsertError;
    }

    // Add transaction record
    const { data: newTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type: 'investment',
          amount: product.price,
          status: 'completed',
          description: `Purchased ${product.name} investment plan`,
          reference_id: newUserProduct.id
        }
      ])
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
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
        message: 'Product purchased successfully', 
        product: newUserProduct 
      }),
    };
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};