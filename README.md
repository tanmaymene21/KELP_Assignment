# CSV to JSON Converter API

A Node.js application that converts CSV files with nested properties to JSON and stores them in PostgreSQL. Built as a coding challenge for KELP.

## What it does

- Parses CSV files with dot-notation for nested properties (like `name.firstName`, `address.city`)
- Converts them to proper JSON objects with nested structures
- Stores the data in PostgreSQL with smart field mapping
- Generates age distribution reports

The CSV parser is custom-built (no third-party libraries like csv-parser or papaparse) as required by the challenge.

## Requirements

- Node.js 14+
- PostgreSQL 12+

## Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE csv_converter_db;
```

3. Run the schema (or let the app create it automatically):
```bash
psql -U postgres -d csv_converter_db -f database/schema.sql
```

4. Configure your environment variables in `.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=csv_converter_db
CSV_FILE_PATH=./data/users.csv
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

**Process CSV file**
```
POST /api/upload/process
```
Reads the CSV file from the configured path, converts it, and stores in the database. Returns the age distribution report.

**Get age distribution report**
```
GET /api/upload/report
```

**Get all users**
```
GET /api/upload/users?limit=10&offset=0
```

**Delete all users**
```
DELETE /api/upload/users
```

**Health check**
```
GET /api/upload/health
```

## How it works

### CSV Parsing

The parser handles:
- Nested properties using dot notation (unlimited depth)
- Quoted fields with commas
- Large files (tested with 50,000+ records)

Example CSV:
```csv
name.firstName,name.lastName,age,address.line1,address.city,gender
John,Doe,30,123 Main St,New York,male
```

Gets converted to:
```json
{
  "name": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "age": 30,
  "address": {
    "line1": "123 Main St",
    "city": "New York"
  },
  "gender": "male"
}
```

### Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,              -- firstName + lastName combined
  age INT NOT NULL,
  address JSONB NULL,     
  additional_info JSONB NULL,         -- any extra fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Mandatory fields (`name.firstName`, `name.lastName`, `age`) are mapped to proper columns. The `address` object goes into the `address` JSONB column. Everything else goes into `additional_info`.

### Age Distribution Report

After processing, you'll see a console report like this:

```
╔═══════════════════════════════════════════╗
║       AGE DISTRIBUTION REPORT             ║
╠═══════════════════════════════════════════╣
║ Total Users: 20                           ║
╠═══════════════╦═══════════╦═══════════════╣
║   Age Group   ║   Count   ║ % Distribution║
╠═══════════════╬═══════════╬═══════════════╣
║ < 20          ║     2     ║    10.00%     ║
║ 20 to 40      ║    10     ║    50.00%     ║
║ 40 to 60      ║     6     ║    30.00%     ║
║ > 60          ║     2     ║    10.00%     ║
╚═══════════════╩═══════════╩═══════════════╝
```

## Project Structure

```
src/
├── app.js                  # Entry point, Express setup
├── config/
│   └── database.js         # PostgreSQL connection
├── parsers/
│   └── csvParser.js        # Custom CSV parser
├── routes/
│   └── upload.js           # API routes
└── services/
    ├── dataProcessor.js    # CSV processing & DB operations
    └── reportGenerator.js  # Age distribution logic

data/
├── users.csv               # Sample data
└── users-complex.csv       # Example with deeper nesting

database/
└── schema.sql              # Table definition
```

## Testing

There's a Postman collection included (`postman_collection.json`) with all the endpoints configured.

## Key Implementation Details

**How does nested property parsing work?**  
The parser splits on dots and recursively builds the object structure. For example, `a.b.c.d` creates `{a: {b: {c: {d: value}}}}`.

**What about performance?**  
The parser processes records in batches and uses PostgreSQL bulk inserts for efficiency. Tested with CSV files containing 50,000+ rows.

## Assumptions Made

- CSV headers are always in the first line
- `name.firstName`, `name.lastName`, and `age` are always present
- Sub-properties of complex objects are grouped together in the CSV
- Age values are valid integers
- The entire `address` object (regardless of how many sub-fields) goes into the `address` JSONB column


---
