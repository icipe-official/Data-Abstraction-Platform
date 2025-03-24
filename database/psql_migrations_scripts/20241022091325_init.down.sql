-- 20241022091325
-- DROP EXTENSION IF EXISTS postgis;
DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS pgcrypto;
DROP TABLE IF EXISTS public.metadata_models_defaults CASCADE;
DROP FUNCTION IF EXISTS public.uuid_generate_v7();
DROP FUNCTION IF EXISTS public.update_last_updated_on();
DROP FUNCTION IF EXISTS public.gen_random_string();