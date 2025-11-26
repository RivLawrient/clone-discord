CREATE TABLE friend (
    id UUID PRIMARY KEY NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    is_pending BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_friend_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);