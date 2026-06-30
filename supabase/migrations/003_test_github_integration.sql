-- Test migration to verify GitHub integration
-- This should auto-apply when pushed to GitHub

-- Create a simple test table
CREATE TABLE IF NOT EXISTS _github_integration_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_message TEXT DEFAULT 'GitHub integration is working! ✅',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test data
INSERT INTO _github_integration_test (test_message) VALUES
    ('Test migration applied successfully from GitHub');

-- You can delete this table later if you want
-- DROP TABLE _github_integration_test;
