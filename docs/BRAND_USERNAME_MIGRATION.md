# Brand Username Migration Guide

This guide explains how to add the `brand_username` field to your existing brands table to enable the new search functionality.

## Steps to Complete the Migration

### 1. Run the Database Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `docs/ADD_BRAND_USERNAME.sql`
4. Copy and paste the entire content
5. Click **Run** to execute the migration

This will:

- Add the `brand_username` column to the brands table
- Create an index for better search performance
- Generate usernames for existing brands based on their brand names
- Add constraints to ensure proper username format
- Create a trigger for automatic username generation

### 2. Verify the Migration

After running the migration, verify it worked correctly:

```sql
-- Check that the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'brands' AND column_name = 'brand_username';

-- Check existing brands have usernames
SELECT brand_name, brand_username FROM brands LIMIT 5;
```

### 3. Update Existing Brand Data (if needed)

If you have existing brands that need custom usernames, you can update them:

```sql
-- Example: Update a specific brand's username
UPDATE brands
SET brand_username = 'custom-username'
WHERE brand_name = 'Your Brand Name';
```

### 4. Test the Search Functionality

1. Start your development server
2. Navigate to the search page
3. Try searching for brand names
4. Click on a brand to navigate to their profile page

## Username Rules

- Must be lowercase
- Can contain letters, numbers, and underscores
- Minimum 3 characters
- Must be unique across all brands
- Will be auto-generated from brand name if not provided

## Example Username Generation

- "Nike" → "nike"
- "Adidas Originals" → "adidasoriginals"
- "Under Armour" → "underarmour"
- "Puma SE" → "pumase"

## Troubleshooting

### If the migration fails:

1. Check if the `brand_username` column already exists
2. Ensure you have proper permissions in Supabase
3. Check the Supabase logs for specific error messages

### If usernames are not generated:

1. Run the UPDATE statement manually
2. Check that the trigger was created successfully
3. Verify the function was created without errors

### If search doesn't work:

1. Verify the API endpoint is accessible
2. Check browser console for errors
3. Ensure the brands table has the correct data
