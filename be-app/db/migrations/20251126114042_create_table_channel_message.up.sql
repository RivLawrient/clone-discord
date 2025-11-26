CREATE TABLE channel_message (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL,
    channel_id UUID NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_channel_msg_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_channel_msg_channel
        FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE
);