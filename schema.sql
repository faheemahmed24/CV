-- Cloudflare D1 Schema for Resumes
CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON string
  updatedAt TEXT NOT NULL
);
CREATE INDEX idx_resumes_userId ON resumes(userId);
