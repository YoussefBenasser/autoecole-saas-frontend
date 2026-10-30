-- ============================================================
-- CLEANUP: Remove French questions (Q1-Q5) from the database
-- ============================================================
-- First remove any test answers that reference these questions/options to avoid FK constraints
DELETE FROM mock_test_answers WHERE question_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555'
);

DELETE FROM question_options WHERE question_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555'
);

DELETE FROM questions WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444',
  'a5555555-5555-5555-5555-555555555555'
);

-- ============================================================
-- ENSURE Arabic questions Q6-Q15 exist (upsert style)
-- ============================================================

-- Q6: تجاوز من اليمين
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a6666666-6666-6666-6666-666666666666', 'هل يمكن تجاوز سيارة من اليمين في تونس؟', 'CIRCULATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b6666661-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'نعم', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b6666662-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'لا', true)
ON CONFLICT (id) DO NOTHING;

-- Q7: السرعة القصوى داخل المناطق العمرانية
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a7777777-7777-7777-7777-777777777777', 'ما هي السرعة القصوى داخل المناطق العمرانية؟', 'CIRCULATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b7777771-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '50 كم/س', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b7777772-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '70 كم/س', false)
ON CONFLICT (id) DO NOTHING;

-- Q8: حزام الأمان
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a8888888-8888-8888-8888-888888888888', 'متى يجب استعمال حزام الأمان؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b8888881-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'في جميع الأوقات', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b8888882-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'فقط في الطرق السريعة', false)
ON CONFLICT (id) DO NOTHING;

-- Q9: الضوء الأحمر
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a9999999-9999-9999-9999-999999999999', 'ما معنى الضوء الأحمر في إشارة المرور؟', 'SIGNALISATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b9999991-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'التوقف', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b9999992-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'المرور بحذر', false)
ON CONFLICT (id) DO NOTHING;

-- Q10: السياقة بدون رخصة
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0100000-0000-0000-0000-000000000000', 'هل يمكن السياقة بدون رخصة؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0100001-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'نعم', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0100002-0000-0000-0000-000000000000', 'a0100000-0000-0000-0000-000000000000', 'لا', true)
ON CONFLICT (id) DO NOTHING;

-- Q11: ممنوع الوقوف
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0110000-0000-0000-0000-000000000000', 'ماذا تعني علامة ممنوع الوقوف؟', 'SIGNALISATION', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0110001-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'ممنوع الوقوف والتوقف', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0110002-0000-0000-0000-000000000000', 'a0110000-0000-0000-0000-000000000000', 'مسموح الوقوف', false)
ON CONFLICT (id) DO NOTHING;

-- Q12: تشغيل الأضواء
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0120000-0000-0000-0000-000000000000', 'متى يجب تشغيل الأضواء؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0120001-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'في الليل أو عند ضعف الرؤية', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0120002-0000-0000-0000-000000000000', 'a0120000-0000-0000-0000-000000000000', 'فقط في النهار', false)
ON CONFLICT (id) DO NOTHING;

-- Q13: الأولوية عند مفترق الطرق
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0130000-0000-0000-0000-000000000000', 'ما هي الأولوية عند مفترق الطرق؟', 'CIRCULATION', NOW(), 'medium', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0130001-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليمين', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0130002-0000-0000-0000-000000000000', 'a0130000-0000-0000-0000-000000000000', 'الأولوية لليسار', false)
ON CONFLICT (id) DO NOTHING;

-- Q14: احترام إشارات المرور
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0140000-0000-0000-0000-000000000000', 'هل يجب احترام إشارات المرور دائماً؟', 'SECURITY', NOW(), 'easy', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0140001-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'نعم', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0140002-0000-0000-0000-000000000000', 'a0140000-0000-0000-0000-000000000000', 'لا', false)
ON CONFLICT (id) DO NOTHING;

-- Q15: الحد الأقصى للسرعة في الطريق السيار
INSERT INTO questions (id, question_text, category, created_at, difficulty, tenant_id)
VALUES ('a0150000-0000-0000-0000-000000000000', 'ما هو الحد الأقصى للسرعة في الطرقات السيارة؟', 'CIRCULATION', NOW(), 'medium', '33ee838a-2002-4933-8760-b00d538e82b3')
ON CONFLICT (id) DO UPDATE SET question_text = EXCLUDED.question_text;

INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0150001-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '110 كم/س', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_options (id, question_id, option_text, is_correct)
VALUES ('b0150002-0000-0000-0000-000000000000', 'a0150000-0000-0000-0000-000000000000', '130 كم/س', true)
ON CONFLICT (id) DO NOTHING;
