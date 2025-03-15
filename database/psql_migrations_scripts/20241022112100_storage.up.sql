-- storage_drives_types table
CREATE TABLE public.storage_drives_types
(
    id text NOT NULL,
    description text NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.storage_drives_types
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_drives_types
    IS 'Types of storage drives supported by the application.';

-- storage_drives table
CREATE TABLE public.storage_drives
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    storage_drive_types_id text NOT NULL,
    description text NOT NULL,
    data json NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (id),
    CONSTRAINT storage_drive_types_id FOREIGN KEY (storage_drive_types_id)
        REFERENCES public.storage_drives_types (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_drives
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_drives
    IS 'Storage drives available for use in directory_groups.';

-- storage_drives trigger to update last_updated_on column
CREATE TRIGGER storage_drives_update_last_updated_on
    BEFORE UPDATE OF data, storage_drive_types_id
    ON public.storage_drives
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER storage_drives_update_last_updated_on ON public.storage_drives
    IS 'update timestamp upon update on relevant columns';

-- storage_drives_authorization_ids table
CREATE TABLE public.storage_drives_authorization_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT storage_drives_id FOREIGN KEY (id)
        REFERENCES public.storage_drives (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID, 
    CONSTRAINT creation_iam_group_authorizations_id FOREIGN KEY (creation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT deactivation_iam_group_authorizations_id FOREIGN KEY (deactivation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_drives_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_drives_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- storage_drives_groups table
CREATE TABLE public.storage_drives_groups
(
    storage_drives_id uuid NOT NULL,
    directory_groups_id uuid NOT NULL,
    directory_id uuid,
    description text,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (storage_drives_id, directory_groups_id),
    CONSTRAINT group_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,    
    CONSTRAINT storage_drives_id FOREIGN KEY (storage_drives_id)
        REFERENCES public.storage_drives (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_drives_groups
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_drives_groups
    IS 'Storage drives available in specific directory_groups.';

-- storage_drives_groups_authorization_ids table
CREATE TABLE public.storage_drives_groups_authorization_ids
(
    storage_drives_id uuid NOT NULL,
    directory_groups_id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (storage_drives_id, directory_groups_id),
    CONSTRAINT storage_drives_groups_id FOREIGN KEY (storage_drives_id, directory_groups_id)
        REFERENCES public.storage_drives_groups (storage_drives_id, directory_groups_id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID, 
    CONSTRAINT creation_iam_group_authorizations_id FOREIGN KEY (creation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT deactivation_iam_group_authorizations_id FOREIGN KEY (deactivation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_drives_groups_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_drives_groups_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- storage_files table
CREATE TABLE public.storage_files
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    storage_drives_id uuid NOT NULL,
    directory_groups_id uuid NOT NULL,
    storage_file_mime_type text,
    original_name text NOT NULL,
    tags text[],
    edit_authorized boolean NOT NULL DEFAULT TRUE,
    edit_unauthorized boolean NOT NULL DEFAULT FALSE,
    view_authorized boolean NOT NULL DEFAULT TRUE,
    view_unauthorized boolean NOT NULL DEFAULT FALSE,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id),
    CONSTRAINT storage_drives_groups_id FOREIGN KEY (storage_drives_id, directory_groups_id)
        REFERENCES public.storage_drives_groups (storage_drives_id, directory_groups_id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_files
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_files
    IS 'Files uploaded to the platform';

CREATE INDEX storage_files_full_text_search_index
    ON public.storage_files USING gin
    (full_text_search);

-- storage_files trigger to update last_updated_on column
CREATE TRIGGER storage_files_update_last_updated_on
    BEFORE UPDATE OF storage_file_mime_type, original_name, tags, edit_authorized, view_authorized, view_unauthorized
    ON public.storage_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER storage_files_update_last_updated_on ON public.storage_files
    IS 'update timestamp upon update on relevant columns';

-- function and trigger to update storage_files->full_text_search
CREATE FUNCTION public.storage_files_update_full_text_search_index()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
DECLARE original_name text;
DECLARE tags text[];

BEGIN
	IF NEW.original_name IS DISTINCT FROM OLD.original_name THEN
		original_name = NEW.original_name;
	ELSE
		original_name = OLD.original_name;
	END IF;
	IF array_length(NEW.tags,1) > 0 THEN
		tags = NEW.tags;
	ELSE
        IF OLD.tags IS NOT NULL THEN
		    tags = OLD.tags;
        ELSE
            tags = '{}';
        END IF;
	END IF;

    NEW.full_text_search = 
        setweight(to_tsvector(coalesce(original_name,'')),'A') ||
        setweight(to_tsvector(coalesce(array_to_string(tags,' ','*'),'')),'B');
    	
	RETURN NEW;   
END
$BODY$;

ALTER FUNCTION public.storage_files_update_full_text_search_index()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.storage_files_update_full_text_search_index()
    IS 'Update full_text_search column in storage_files when original_name and tags change';

CREATE TRIGGER storage_files_update_full_text_search_index
    BEFORE INSERT OR UPDATE OF original_name, tags
    ON public.storage_files
    FOR EACH ROW
    EXECUTE FUNCTION public.storage_files_update_full_text_search_index();

COMMENT ON TRIGGER storage_files_update_full_text_search_index ON public.storage_files
    IS 'trigger to update full_text_search column';

-- storage_files_authorization_ids table
CREATE TABLE public.storage_files_authorization_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT storage_files_id FOREIGN KEY (id)
        REFERENCES public.storage_files (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID, 
    CONSTRAINT creation_iam_group_authorizations_id FOREIGN KEY (creation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT deactivation_iam_group_authorizations_id FOREIGN KEY (deactivation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.storage_files_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.storage_files_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';
