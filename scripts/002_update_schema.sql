-- Update the reports table to ensure imageEmbedding field supports proper data types
-- This script ensures the database schema matches our Prisma model

-- Add index for better performance on similarity searches
CREATE INDEX IF NOT EXISTS idx_reports_image_embedding ON reports USING gin(image_embedding);

-- Add index for similar reports array
CREATE INDEX IF NOT EXISTS idx_reports_similar_reports ON reports USING gin(similar_reports);

-- Add index for category and status for faster filtering
CREATE INDEX IF NOT EXISTS idx_reports_category_status ON reports(category, status);

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(latitude, longitude);
