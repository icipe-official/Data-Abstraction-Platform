-- 20241022112100

DROP TABLE IF EXISTS public.storage_files_authorization_ids;
DROP TABLE IF EXISTS public.storage_files;
DROP TABLE IF EXISTS public.storage_drives_groups_authorization_ids;
DROP TABLE IF EXISTS public.storage_drives_groups;
DROP TABLE IF EXISTS public.group_storage_drives_authorization_ids;
DROP TABLE IF EXISTS public.group_storage_drives;
DROP TABLE IF EXISTS public.storage_drives_authorization_ids;
DROP TABLE IF EXISTS public.storage_drives;
DROP TABLE IF EXISTS public.storage_drives_types;
DROP FUNCTION IF EXISTS public.storage_files_update_full_text_search_index();