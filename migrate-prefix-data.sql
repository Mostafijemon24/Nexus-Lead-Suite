-- ============================================================================
--  nexus-lead-suite : ডেটাবেজ prefix migration  (nexus_ls_  ->  nexulesuite_)
-- ----------------------------------------------------------------------------
--  কোডের সব প্রিফিক্স `nexulesuite_` করা হয়েছে। কিন্তু ডেটাবেজে সেভ থাকা পুরোনো
--  ডেটা এখনো `nexus_ls_` নামে আছে। এই স্ক্রিপ্ট সেগুলো নতুন নামে নিয়ে আসে,
--  যাতে আগের ফর্ম / সেটিংস / সাবমিশন হারিয়ে না যায়।
--
--  চালানোর আগে:
--    1) ★ ডেটাবেজের ব্যাকআপ নিন (Local: Database ট্যাব → Export, অথবা mysqldump)।
--    2) সম্ভব হলে renamed প্লাগিন লোড হওয়ার আগে (deactivated অবস্থায়) চালান —
--       নাহলে প্লাগিন নতুন নামে খালি default row তৈরি করে রাখতে পারে।
--    3) table prefix যদি `wp_` না হয়, নিচের সব `wp_` খুঁজে আপনার prefix-এ বদলান।
--
--  চালানোর উপায় (যেকোনো একটি):
--    • Local → Database (Adminer) → SQL command → পেস্ট → Execute
--    • টার্মিনাল:  wp db query < migrate-prefix-data.sql      (WP-CLI থাকলে)
--    • mysql ক্লায়েন্ট:  mysql <db> < migrate-prefix-data.sql
--
--  চালানোর পর এই ফাইলটি মুছে ফেলতে পারেন (এটি প্লাগিনের অংশ নয়)।
-- ============================================================================

START TRANSACTION;

-- 1) Options  (option_name UNIQUE — তাই নতুন নাম আগে থেকেই থাকলে skip করা হয়)
UPDATE wp_options o
  LEFT JOIN wp_options n
    ON n.option_name = CONCAT('nexulesuite_', SUBSTRING(o.option_name, 10))
SET o.option_name = CONCAT('nexulesuite_', SUBSTRING(o.option_name, 10))
WHERE o.option_name LIKE 'nexus\_ls\_%'
  AND n.option_name IS NULL;

-- 2) Post meta  (গোপন key শুরু হয় `_` দিয়ে, যেমন _nexus_ls_ve_dom_patches)
UPDATE wp_postmeta
SET meta_key = CONCAT('_nexulesuite_', SUBSTRING(meta_key, 11))
WHERE meta_key LIKE '\_nexus\_ls\_%';

UPDATE wp_postmeta
SET meta_key = CONCAT('nexulesuite_', SUBSTRING(meta_key, 10))
WHERE meta_key LIKE 'nexus\_ls\_%';

-- 3) User meta  (client-access ইত্যাদি; না থাকলে 0 rows — ক্ষতি নেই)
UPDATE wp_usermeta
SET meta_key = CONCAT('_nexulesuite_', SUBSTRING(meta_key, 11))
WHERE meta_key LIKE '\_nexus\_ls\_%';

UPDATE wp_usermeta
SET meta_key = CONCAT('nexulesuite_', SUBSTRING(meta_key, 10))
WHERE meta_key LIKE 'nexus\_ls\_%';

-- 4) পোস্ট/পপআপ কনটেন্টে পুরোনো shortcode -> [nexulesuite_form]
UPDATE wp_posts
SET post_content = REPLACE(post_content, '[smart_trigger_form', '[nexulesuite_form')
WHERE post_content LIKE '%[smart_trigger_form%';

UPDATE wp_posts
SET post_content = REPLACE(post_content, '[nexus_ls_form', '[nexulesuite_form')
WHERE post_content LIKE '%[nexus_ls_form%';

COMMIT;

-- 5) কাস্টম টেবিল rename  (transaction-এর বাইরে — DDL auto-commit হয়)
--    টেবিল না থাকলে লাইনটি error দেবে; সে ক্ষেত্রে শুধু ঐ লাইন বাদ দিন।
RENAME TABLE wp_nexus_ls_submissions  TO wp_nexulesuite_submissions;
RENAME TABLE wp_nexus_ls_interactions TO wp_nexulesuite_interactions;

-- ============================================================================
--  যাচাই (ঐচ্ছিক) — নিচেরগুলো 0 দিলে পুরোনো নাম আর অবশিষ্ট নেই:
--    SELECT COUNT(*) FROM wp_options  WHERE option_name LIKE 'nexus\_ls\_%';
--    SELECT COUNT(*) FROM wp_postmeta WHERE meta_key   LIKE '%nexus\_ls\_%';
--    SHOW TABLES LIKE 'wp_nexulesuite\_%';
-- ============================================================================
