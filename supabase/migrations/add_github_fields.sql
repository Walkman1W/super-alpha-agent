-- Migration: Add GitHub fields to agents table
-- Date: 2025-12-05
-- Description: Extends agents table with GitHub-specific fields for crawler integration

-- Add GitHub-related columns to agents table
ALTER TABLE agents 
  ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS github_owner TEXT,
  ADD COLUMN IF NOT EXISTS github_topics TEXT[];

-- Create index for GitHub stars sorting (descending order for top repos)
CREATE INDEX IF NOT EXISTS idx_agents_github_stars ON agents(github_stars DESC);

-- Create index for source field to filter by data source
CREATE INDEX IF NOT EXISTS idx_agents_source ON agents(source);

-- Add comment for documentation
COMMENT ON COLUMN agents.github_stars IS 'Number of stars on GitHub repository';
COMMENT ON COLUMN agents.github_url IS 'Full URL to GitHub repository';
COMMENT ON COLUMN agents.github_owner IS 'GitHub repository owner username';
COMMENT ON COLUMN agents.github_topics IS 'Array of GitHub repository topics/tags';
