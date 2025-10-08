-- Supabase Schema for Investment Website

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_invested DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    daily_income DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- in days
    total_return DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL
);

-- User products (investments)
CREATE TABLE user_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    daily_income DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active', -- active, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- recharge, withdrawal, daily_income, referral
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    description TEXT,
    reference_id VARCHAR(100), -- UTR number for recharges
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(10) NOT NULL, -- bank, upi
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    account_number VARCHAR(30),
    account_holder_name VARCHAR(100),
    upi_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Referrals table
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id),
    referred_id UUID REFERENCES users(id),
    level INTEGER NOT NULL, -- 1, 2, or 3
    commission_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recharges table
CREATE TABLE recharges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    utr_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);
CREATE INDEX idx_user_products_user_id ON user_products(user_id);
CREATE INDEX idx_user_products_product_id ON user_products(product_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_recharges_user_id ON recharges(user_id);
CREATE INDEX idx_recharges_status ON recharges(status);

-- Insert the 10 investment products
INSERT INTO products (id, name, price, daily_income, duration, total_return, profit) VALUES
(1, 'Starter Plan', 490.00, 80.00, 9, 720.00, 230.00),
(2, 'Smart Saver', 750.00, 85.00, 14, 1190.00, 440.00),
(3, 'Bronze Booster', 1000.00, 100.00, 15, 1500.00, 500.00),
(4, 'Silver Growth', 1500.00, 115.00, 20, 2300.00, 800.00),
(5, 'Gold Income', 2000.00, 135.00, 23, 3105.00, 1105.00),
(6, 'Platinum Plan', 2500.00, 160.00, 24, 3840.00, 1340.00),
(7, 'Elite Earning', 3000.00, 180.00, 25, 4500.00, 1500.00),
(8, 'VIP Profiter', 3500.00, 200.00, 27, 5400.00, 1900.00),
(9, 'Executive Growth', 4000.00, 220.00, 28, 6160.00, 2160.00),
(10, 'Royal Investor', 5000.00, 250.00, 30, 7500.00, 2500.00);

-- Insert admin user (password will be hashed in the application)
INSERT INTO users (phone_number, username, name, password_hash, referral_code, is_admin) 
VALUES ('9999999999', 'admin', 'Admin User', 'hashed_admin_password_placeholder', 'ADMIN001', true);