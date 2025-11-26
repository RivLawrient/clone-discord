CREATE TABLE channel_category (
    id UUID PRIMARY KEY NOT NULL,
    server_id UUID NOT NULL,
    name TEXT NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_channel_category_server
        FOREIGN KEY (server_id) REFERENCES server(id) ON DELETE CASCADE
);