-- Connect to the database
\c
csv_converter_db;

-- Create users table
CREATE TABLE
IF NOT EXISTS public.users
(
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  age INT NOT NULL,
  address JSONB NULL,
  additional_info JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
