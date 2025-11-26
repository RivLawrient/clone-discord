CREATE TABLE channel (
    id UUID PRIMARY KEY NOT NULL,
    server_id UUID NOT NULL,
    channel_category_id UUID,
    name TEXT NOT NULL,
    position INT NOT NULL,
    is_voice BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_channel_server
        FOREIGN KEY (server_id) REFERENCES server(id) ON DELETE CASCADE,

    CONSTRAINT fk_channel_category
        FOREIGN KEY (channel_category_id) REFERENCES channel_category(id) ON DELETE SET NULL
);