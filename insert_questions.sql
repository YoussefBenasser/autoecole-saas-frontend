-- Q1
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a1111111-1111-1111-1111-111111111111', 'Je peux dépasser par la droite :', 'CIRCULATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Oui', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b1111112-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Non', true);

-- Q2
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a2222222-2222-2222-2222-222222222222', 'Le taux dalcoolémie maximal autorisé pour un conducteur novice est de :', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b2222221-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '0.2 g/l', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '0.5 g/l', false);

-- Q3
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a3333333-3333-3333-3333-333333333333', 'La distance de sécurité minimale en agglomération dépend :', 'CIRCULATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b3333331-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'De la vitesse', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b3333332-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Du marquage', false);

-- Q4
INSERT INTO questions (id, question_text, category, created_at, difficulty, image_url, tenant_id) VALUES ('a4444444-4444-4444-4444-444444444444', 'Que signifie ce panneau ? (Octogone rouge)', 'SIGNALISATION', NOW(), 'EASY', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Zeichen_206_-_Halt%21_Vorfahrt_gew%C3%A4hren%21%2C_StVO_1970.svg/200px-Zeichen_206_-_Halt%21_Vorfahrt_gew%C3%A4hren%21%2C_StVO_1970.svg.png', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b4444441-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Cédez le passage', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b4444442-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Arrêt obligatoire (STOP)', true);

-- Q5
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a5555555-5555-5555-5555-555555555555', 'L''utilisation du téléphone au volant est autorisée avec :', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b5555551-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'Le système Bluetooth intégré', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b5555552-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'Des écouteurs', false);
-- Q6
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a6666666-6666-6666-6666-666666666666', 'هل يمكن تجاوز سيارة من اليمين في تونس؟', 'CIRCULATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b6666661-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'نعم', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b6666662-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'لا', true);

-- Q7
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a7777777-7777-7777-7777-777777777777', 'ما هي السرعة القصوى داخل المناطق العمرانية؟', 'CIRCULATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b7777771-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '50 كم/س', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b7777772-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '70 كم/س', false);

-- Q8
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a8888888-8888-8888-8888-888888888888', 'متى يجب استعمال حزام الأمان؟', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b8888881-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'في جميع الأوقات', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b8888882-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'فقط في الطرق السريعة', false);

-- Q9
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a9999999-9999-9999-9999-999999999999', 'ما معنى الضوء الأحمر في إشارة المرور؟', 'SIGNALISATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b9999991-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'التوقف', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b9999992-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'المرور بحذر', false);

-- Q10
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0100000-0000-0000-0000-000000000000', 'هل يمكن السياقة بدون رخصة؟', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0100001-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'نعم', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0100002-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'لا', true);

-- Q11
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0110000-0000-0000-0000-000000000000', 'ماذا تعني علامة ممنوع الوقوف؟', 'SIGNALISATION', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0110001-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'ممنوع الوقوف والتوقف', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0110002-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'مسموح الوقوف', false);

-- Q12
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0120000-0000-0000-0000-000000000000', 'متى يجب تشغيل الأضواء؟', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0120001-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'في الليل أو عند ضعف الرؤية', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0120002-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'فقط في النهار', false);

-- Q13
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0130000-0000-0000-0000-000000000000', 'ما هي الأولوية عند مفترق الطرق؟', 'CIRCULATION', NOW(), 'MEDIUM', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0130001-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليمين', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0130002-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليسار', false);

-- Q14
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0140000-0000-0000-0000-000000000000', 'هل يجب احترام إشارات المرور دائماً؟', 'SECURITY', NOW(), 'EASY', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0140001-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'نعم', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0140002-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'لا', false);

-- Q15
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0150000-0000-0000-0000-000000000000', 'ما هو الحد الأقصى للسرعة في الطرقات السيارة؟', 'CIRCULATION', NOW(), 'MEDIUM', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0150001-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '110 كم/س', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0150002-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '130 كم/س', true);
