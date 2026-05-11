-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name)
SELECT 'Technology' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Technology');
INSERT INTO categories (name)
SELECT 'Music' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Music');
INSERT INTO categories (name)
SELECT 'Sports' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Sports');
INSERT INTO categories (name)
SELECT 'Education' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Education');
INSERT INTO categories (name)
SELECT 'Gaming' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Gaming');
INSERT INTO categories (name)
SELECT 'Business' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Business');
INSERT INTO categories (name)
SELECT 'Art' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Art');

-- =========================
-- TICKET TYPES
-- =========================
INSERT INTO ticket_types (name)
SELECT 'VIP' WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='VIP');
INSERT INTO ticket_types (name)
SELECT 'General' WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='General');
INSERT INTO ticket_types (name)
SELECT 'Oro' WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Oro');
INSERT INTO ticket_types (name)
SELECT 'Plata' WHERE NOT EXISTS (SELECT 1 FROM ticket_types WHERE name='Plata');

-- =========================
-- EVENTS (All in the future - from 2026 onwards)
-- =========================
INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Spring Boot Conference','Conference about Spring Boot and microservices',TIMESTAMP '2026-08-15 09:00:00','ACTIVE',true,'https://2025.springio.net/images/pics/pic-spring-18.jpg',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Spring Boot Conference');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Rock Festival','Outdoor rock music festival',TIMESTAMP '2026-09-20 18:00:00','ACTIVE',true,'https://img.freepik.com/vector-gratis/cartel-festival-rock-acuarela_23-2147509512.jpg?semt=ais_incoming&w=740&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Rock Festival');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Startup Networking Night','Networking event for entrepreneurs and startups',TIMESTAMP '2026-07-10 19:00:00','ACTIVE',true,'https://cdn.outrank.so/a92fdcba-f8f3-4de4-b1ea-cb8b309987fa/featured-image-6a7f316d-8c4d-4933-a8bc-5d10ff1c6ace.jpg',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Startup Networking Night');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'AI & Machine Learning Summit','Conference focused on AI trends and research',TIMESTAMP '2026-10-12 10:00:00','ACTIVE',true,'https://s3.us-east-1.amazonaws.com/itipix.com/images_nl/sw/DS25_OG%20Website_1200x630_c1.jpg',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='AI & Machine Learning Summit');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'National Gaming Expo','Gaming competition and expo with major studios',TIMESTAMP '2026-11-05 14:00:00','ACTIVE',true,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2q0uzBxeUnHRnH2Q7OZS_fRhFqMJhTF7g1Q&s',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='National Gaming Expo');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'City Marathon','Annual marathon through the city center',TIMESTAMP '2026-12-02 06:30:00','ACTIVE',true,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZUirvdW98GHVNBguNXlkMY9kom33AxYldZA&s',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='City Marathon');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Cybersecurity Workshop','Hands-on workshop on cybersecurity fundamentals',TIMESTAMP '2026-08-25 09:30:00','ACTIVE',true,'https://assets.chaminade.edu/wp-content/uploads/sites/4/2023/12/08193628/Cybersecurity-Workshop_cn-header2_1600x800-1.jpg',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Cybersecurity Workshop');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Bubaseta Concert','Gianni Canisso is a Chilean MC born in Switzerland but raised in Quilpué, Valparaíso. He became known for his unique rapping style, which sparked much debate among rap listeners during his time.',TIMESTAMP '2026-07-15 20:00:00','ACTIVE',true,'https://rtvc-assets-radionica3.s3.amazonaws.com/s3fs-public/styles/articulo_760x422/public/2025-07/_BUBASETa_en_bogota_.jpg?itok=F2d_5613',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Bubaseta Concert');

INSERT INTO events (name, description, date, status, active, image_url, last_updated)
SELECT 'Togashi Comes!!','Yoshihiro Togashii is a Japanese manga artist and illustrator, best known for his work on Hunter x Hunter and Yu Yu Hakusho. Most of his work has been published in Weekly Shonen Jump magazine.',TIMESTAMP '2026-09-16 16:00:00','ACTIVE',true,'https://i.pinimg.com/1200x/83/ff/66/83ff66ddbdd8e7b31daeb9cb8caf782d.jpg',NOW()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Togashi Comes!!');

-- =========================
-- EVENT CATEGORY RELATION
-- =========================
INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Spring Boot Conference' AND c.name='Technology'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Rock Festival' AND c.name='Music'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Startup Networking Night' AND c.name='Business'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='AI & Machine Learning Summit' AND c.name='Technology'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='National Gaming Expo' AND c.name='Gaming'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='City Marathon' AND c.name='Sports'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Cybersecurity Workshop' AND c.name='Technology'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Bubaseta Concert' AND c.name='Music'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

INSERT INTO event_category (event_id, category_id)
SELECT e.event_id, c.category_id FROM events e, categories c
WHERE e.name='Togashi Comes!!' AND c.name='Art'
AND NOT EXISTS (SELECT 1 FROM event_category ec WHERE ec.event_id=e.event_id AND ec.category_id=c.category_id);

-- =========================
-- EVENT TICKETS
-- =========================

-- Spring Boot Conference
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 150, 0, 120.0 FROM events e, ticket_types t
WHERE e.name='Spring Boot Conference' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 300, 0, 60.0 FROM events e, ticket_types t
WHERE e.name='Spring Boot Conference' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- Rock Festival
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 100, 0, 100.0 FROM events e, ticket_types t
WHERE e.name='Rock Festival' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 200, 0, 50.0 FROM events e, ticket_types t
WHERE e.name='Rock Festival' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 50, 0, 200.0 FROM events e, ticket_types t
WHERE e.name='Rock Festival' AND t.name='Oro'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- Startup Networking Night
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 80, 0, 90.0 FROM events e, ticket_types t
WHERE e.name='Startup Networking Night' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 250, 0, 40.0 FROM events e, ticket_types t
WHERE e.name='Startup Networking Night' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- AI & Machine Learning Summit
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 100, 0, 180.0 FROM events e, ticket_types t
WHERE e.name='AI & Machine Learning Summit' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 400, 0, 75.0 FROM events e, ticket_types t
WHERE e.name='AI & Machine Learning Summit' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 60, 0, 250.0 FROM events e, ticket_types t
WHERE e.name='AI & Machine Learning Summit' AND t.name='Oro'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- National Gaming Expo
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 120, 0, 85.0 FROM events e, ticket_types t
WHERE e.name='National Gaming Expo' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 500, 0, 35.0 FROM events e, ticket_types t
WHERE e.name='National Gaming Expo' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 30, 0, 150.0 FROM events e, ticket_types t
WHERE e.name='National Gaming Expo' AND t.name='Plata'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- City Marathon
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 200, 0, 45.0 FROM events e, ticket_types t
WHERE e.name='City Marathon' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 50, 0, 110.0 FROM events e, ticket_types t
WHERE e.name='City Marathon' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- Cybersecurity Workshop
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 80, 0, 95.0 FROM events e, ticket_types t
WHERE e.name='Cybersecurity Workshop' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 200, 0, 45.0 FROM events e, ticket_types t
WHERE e.name='Cybersecurity Workshop' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- Bubaseta Concert
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 100, 0, 100.0 FROM events e, ticket_types t
WHERE e.name='Bubaseta Concert' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 700, 0, 30.0 FROM events e, ticket_types t
WHERE e.name='Bubaseta Concert' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

-- Togashi Comes!!
INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 40, 0, 100.0 FROM events e, ticket_types t
WHERE e.name='Togashi Comes!!' AND t.name='VIP'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);

INSERT INTO event_tickets (event_id, ticket_type_id, total_quantity, sold_quantity, price)
SELECT e.event_id, t.id, 500, 0, 5.0 FROM events e, ticket_types t
WHERE e.name='Togashi Comes!!' AND t.name='General'
AND NOT EXISTS (SELECT 1 FROM event_tickets et WHERE et.event_id=e.event_id AND et.ticket_type_id=t.id);