-- Q6
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a6666666-6666-6666-6666-666666666666', 'هل يمكن تجاوز سيارة من اليمين في تونس؟', 'CIRCULATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b6666661-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'نعم', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b6666662-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'لا', true);

-- Q7
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a7777777-7777-7777-7777-777777777777', 'ما هي السرعة القصوى داخل المناطق العمرانية؟', 'CIRCULATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b7777771-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '50 كم/س', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b7777772-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '70 كم/س', false);

-- Q8
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a8888888-8888-8888-8888-888888888888', 'متى يجب استعمال حزام الأمان؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b8888881-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'في جميع الأوقات', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b8888882-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'فقط في الطرق السريعة', false);

-- Q9
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a9999999-9999-9999-9999-999999999999', 'ما معنى الضوء الأحمر في إشارة المرور؟', 'SIGNALISATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b9999991-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'التوقف', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b9999992-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'المرور بحذر', false);

-- Q10
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0100000-0000-0000-0000-000000000000', 'هل يمكن السياقة بدون رخصة؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0100001-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'نعم', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0100002-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'لا', true);

-- Q11
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0110000-0000-0000-0000-000000000000', 'ماذا تعني علامة ممنوع الوقوف؟', 'SIGNALISATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0110001-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'ممنوع الوقوف والتوقف', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0110002-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'مسموح الوقوف', false);

-- Q12
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0120000-0000-0000-0000-000000000000', 'متى يجب تشغيل الأضواء؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0120001-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'في الليل أو عند ضعف الرؤية', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0120002-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'فقط في النهار', false);

-- Q13
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0130000-0000-0000-0000-000000000000', 'ما هي الأولوية عند مفترق الطرق؟', 'CIRCULATION', NOW(), 'medium', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0130001-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليمين', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0130002-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليسار', false);

-- Q14
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0140000-0000-0000-0000-000000000000', 'هل يجب احترام إشارات المرور دائماً؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0140001-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'نعم', true);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0140002-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'لا', false);

-- Q15
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id) VALUES ('a0150000-0000-0000-0000-000000000000', 'ما هو الحد الأقصى للسرعة في الطرقات السيارة؟', 'CIRCULATION', NOW(), 'medium', '33ee838a-2002-4933-8760-b00d538e82b3');
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0150001-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '110 كم/س', false);
INSERT INTO question_options (id, question_id, option_text, is_correct) VALUES ('b0150002-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '130 كم/س', true);
