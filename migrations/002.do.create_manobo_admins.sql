CREATE TABLE manobo_admins (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    admin_name TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    date_modified TIMESTAMPTZ
);

ALTER TABLE manobo_leads
    ADD COLUMN 
        admin_id INTEGER REFERENCES manobo_admins(id)
        ON DELETE SET NULL;