-- 20241022101641

DROP TABLE IF EXISTS public.iam_group_authorizations;
DROP TABLE IF EXISTS public.group_rule_authorizations;
DROP TABLE IF EXISTS public.group_authorization_rules;
DROP FUNCTION IF EXISTS public.group_authorization_rules_update_full_text_search_index();