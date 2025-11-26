CREATE TABLE join_server (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    server_id UUID NOT NULL,
    position INT NOT NULL,
    is_owner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_js_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_js_server
        FOREIGN KEY (server_id) REFERENCES server(id) ON DELETE CASCADE
);