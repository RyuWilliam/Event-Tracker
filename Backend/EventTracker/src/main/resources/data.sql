-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name)
SELECT 'Technology'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Technology');

INSERT INTO categories (name)
SELECT 'Music'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Music');

INSERT INTO categories (name)
SELECT 'Sports'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Sports');

INSERT INTO categories (name)
SELECT 'Education'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Education');

INSERT INTO categories (name)
SELECT 'Gaming'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Gaming');

INSERT INTO categories (name)
SELECT 'Business'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Business');

-- =========================
-- TICKET TYPES
-- =========================
INSERT INTO ticket_types (name)
SELECT 'VIP'
WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='VIP');

INSERT INTO ticket_types (name)
SELECT 'General'
WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='General');

INSERT INTO ticket_types (name)
SELECT 'Oro'
WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Oro');

INSERT INTO ticket_types (name)
SELECT 'Plata'
WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Plata');


-- =========================
-- EVENTS
-- =========================
INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'Spring Boot Conference',
'Conference about Spring Boot and microservices',
TIMESTAMP '2026-06-15 09:00:00',
'ACTIVE',
true,
'https://example.com/springboot.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Spring Boot Conference');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'Rock Festival',
'Outdoor rock music festival',
TIMESTAMP '2026-07-20 18:00:00',
'ACTIVE',
true,
'https://example.com/rock.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Rock Festival');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'Startup Networking Night',
'Networking event for entrepreneurs and startups',
TIMESTAMP '2026-05-10 19:00:00',
'ACTIVE',
true,
'https://example.com/startup.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Startup Networking Night');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'AI & Machine Learning Summit',
'Conference focused on AI trends and research',
TIMESTAMP '2026-08-12 10:00:00',
'ACTIVE',
true,
'https://example.com/ai.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='AI & Machine Learning Summit');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'National Gaming Expo',
'Gaming competition and expo with major studios',
TIMESTAMP '2026-09-05 14:00:00',
'ACTIVE',
true,
'https://example.com/gaming.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='National Gaming Expo');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'City Marathon',
'Annual marathon through the city center',
TIMESTAMP '2026-04-02 06:30:00',
'ACTIVE',
true,
'https://example.com/marathon.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='City Marathon');


INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT
'Cybersecurity Workshop',
'Hands-on workshop on cybersecurity fundamentals',
TIMESTAMP '2026-06-25 09:30:00',
'ACTIVE',
true,
'https://example.com/cyber.jpg',
NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Cybersecurity Workshop');


-- =========================
-- EVENT CATEGORY RELATION
-- =========================

-- Spring Boot Conference -> Technology
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='Spring Boot Conference'
AND c.name='Technology'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- Rock Festival -> Music
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='Rock Festival'
AND c.name='Music'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- Startup Networking Night -> Business
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='Startup Networking Night'
AND c.name='Business'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- AI Summit -> Technology
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='AI & Machine Learning Summit'
AND c.name='Technology'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- Gaming Expo -> Gaming
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='National Gaming Expo'
AND c.name='Gaming'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- Marathon -> Sports
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='City Marathon'
AND c.name='Sports'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);

-- Cybersecurity Workshop -> Technology
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id
FROM events e, categories c
WHERE e.name='Cybersecurity Workshop'
AND c.name='Technology'
AND NOT EXISTS (
SELECT 1 FROM event_category ec
WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id
);


INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 100, 0, 100.0
FROM events e, ticket_types t
WHERE e.name='Rock Festival' AND t.name='VIP';

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 200, 0, 50.0
FROM events e, ticket_types t
WHERE e.name='Rock Festival' AND t.name='General';