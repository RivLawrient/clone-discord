CREATE TABLE user_message (
    id UUID PRIMARY KEY NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_user_msg_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_user_msg_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);