-- 20241022105411

ALTER TABLE IF EXISTS public.metadata_models_defaults
    DROP CONSTRAINT metadata_models_id;
    
ALTER TABLE IF EXISTS public.metadata_models_defaults
    DROP COLUMN metadata_models_id;

DROP TABLE IF EXISTS public.metadata_models_authorization_ids;
DROP TABLE IF EXISTS public.metadata_models;
DROP FUNCTION IF EXISTS public.metadata_models_update_full_text_search_index();