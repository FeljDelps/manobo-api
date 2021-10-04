BEGIN;

TRUNCATE
    manobo_leads,
    manobo_admins
    RESTART IDENTITY CASCADE;

INSERT INTO manobo_admins (admin_name, full_name, password)
VALUES
    ('admin', 'Manobo Admin', 'password');

INSERT INTO manobo_leads (lead_name, email, phone, comment)
VALUES 
('person 1', 'person1@gmail.com', '(111) 111-1111', 'person 1s comment'),
('person 2', 'person2@gmail.com', '(222) 222-2222', 'person 2s comment'),
('person 3', 'person3@gmail.com', '(333) 333-3333', 'person 3s comment');

COMMIT;