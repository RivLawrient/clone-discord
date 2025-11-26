CREATE TABLE server (
    id UUID PRIMARY KEY NOT NULL,
    name TEXT,
    profile_image TEXT,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);