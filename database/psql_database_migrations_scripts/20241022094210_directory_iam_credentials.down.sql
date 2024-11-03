-- 20241022094210

DROP TABLE IF EXISTS public.iam_credentials;
DROP TABLE IF EXISTS public.iam_ticket_types;
DROP TABLE IF EXISTS public.directory;
DROP FUNCTION IF EXISTS public.iam_credentials_gen_pin_salt();
DROP FUNCTION IF EXISTS public.iam_credentials_gen_passcode_salt();