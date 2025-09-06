-- Initial database setup for MetroCare
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_votes_report_user ON votes(report_id, user_id);

-- Insert sample issue categories and subcategories
INSERT INTO reports (id, title, description, category, latitude, longitude, address, reporter_id, created_at) VALUES
('sample-1', 'Large pothole on Main Street', 'Deep pothole causing vehicle damage near intersection', 'ROADS_TRANSPORT', 40.7128, -74.0060, '123 Main St, New York, NY', 'admin-user', NOW()),
('sample-2', 'Broken streetlight in park', 'Streetlight not working, creating safety concern', 'UTILITIES', 40.7589, -73.9851, 'Central Park West, New York, NY', 'admin-user', NOW()),
('sample-3', 'Graffiti on city building', 'Vandalism on public property needs cleanup', 'ENVIRONMENT', 40.7505, -73.9934, 'City Hall, New York, NY', 'admin-user', NOW());
