CREATE TABLE user_profile (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar VARCHAR(255),
    avatar_bg VARCHAR(7),
    banner_color VARCHAR(7),
    birthdate DATE NOT NULL,
    status_activity VARCHAR(255) DEFAULT 'Invisible',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_user_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);