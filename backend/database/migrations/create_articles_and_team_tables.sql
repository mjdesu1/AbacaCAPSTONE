-- Create articles table for news and educational content
CREATE TABLE IF NOT EXISTS articles (
  article_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'Sustainability', 'Success Stories', 'Education'
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author VARCHAR(100),
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES association_officers(officer_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table for MAO Culiram team
CREATE TABLE IF NOT EXISTS team_members (
  member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  email VARCHAR(100),
  phone VARCHAR(20),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES association_officers(officer_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_active ON team_members(is_active);

-- Add comments
COMMENT ON TABLE articles IS 'Stores news articles and educational content';
COMMENT ON TABLE team_members IS 'Stores MAO Culiram team member information';
