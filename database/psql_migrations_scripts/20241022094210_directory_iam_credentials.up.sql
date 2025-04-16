-- directory table
CREATE TABLE public.directory
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_groups_id uuid NOT NULL,
    display_name text,
    data jsonb,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id),
    CONSTRAINT group_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.directory
    OWNER to pg_database_owner;

COMMENT ON TABLE public.directory
    IS 'People such as group users created by different people in the system';

CREATE INDEX directory_full_text_search_index
    ON public.directory USING gin
    (full_text_search);

CREATE INDEX directory_data_jsonb_index
    ON public.directory USING gin
    (data);

-- trigger to update directory->last_updated_on column
CREATE TRIGGER directory_update_last_updated_on
    BEFORE UPDATE OF data, display_name
    ON public.directory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER directory_update_last_updated_on ON public.directory
    IS 'update timestamp upon update on relevant columns';

-- iam credentials table
CREATE TABLE public.iam_credentials
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_id uuid,
    openid_sub uuid NOT NULL UNIQUE,
    openid_preferred_username text NOT NULL,
    openid_email text NOT NULL,
    openid_email_verified bool,
    openid_given_name text,
    openid_family_name text,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id),
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.iam_credentials
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_credentials
    IS 'Credentials for authentication';

CREATE INDEX iam_credentials_full_text_search_index
    ON public.iam_credentials USING gin
    (full_text_search);

-- trigger to update iam_credentials->last_updated_on column
CREATE TRIGGER iam_credentials_update_last_updated_on
    BEFORE UPDATE OF directory_id, openid_sub, openid_preferred_username, openid_email, openid_email_verified, openid_given_name, openid_family_name, deactivated_on
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER iam_credentials_update_last_updated_on ON public.iam_credentials
    IS 'update timestamp upon update on relevant columns';

-- function and trigger to update iam_credentials->full_text_search
CREATE FUNCTION public.iam_credentials_update_full_text_search_index()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
DECLARE openid_preferred_username text;
DECLARE openid_email text;
DECLARE openid_given_name text;
DECLARE openid_family_name text;

BEGIN
	IF NEW.openid_preferred_username IS DISTINCT FROM OLD.openid_preferred_username THEN
		openid_preferred_username = NEW.openid_preferred_username;
	ELSE
		openid_preferred_username = OLD.openid_preferred_username;
	END IF;
    IF NEW.openid_email IS DISTINCT FROM OLD.openid_email THEN
		openid_email = NEW.openid_email;
	ELSE
		openid_email = OLD.openid_email;
	END IF;
    IF NEW.openid_given_name IS DISTINCT FROM OLD.openid_given_name THEN
		openid_given_name = NEW.openid_given_name;
	ELSE
		openid_given_name = OLD.openid_given_name;
	END IF;
    IF NEW.openid_family_name IS DISTINCT FROM OLD.openid_family_name THEN
		openid_family_name = NEW.openid_family_name;
	ELSE
		openid_family_name = OLD.openid_family_name;
	END IF;

    NEW.full_text_search = 
        setweight(to_tsvector(coalesce(openid_preferred_username,'')),'A') ||
        setweight(to_tsvector(coalesce(openid_email,'')),'B') ||
        setweight(to_tsvector(coalesce(openid_given_name,'')),'C') ||
        setweight(to_tsvector(coalesce(openid_family_name,'')),'D');
    	
	RETURN NEW;   
END
$BODY$;

ALTER FUNCTION public.iam_credentials_update_full_text_search_index()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.iam_credentials_update_full_text_search_index()
    IS 'Update full_text_search column in iam_credentials when openid_preferred_username, openid_email, openid_given_name, and openid_family_name change';

CREATE TRIGGER iam_credentials_update_full_text_search_index
    BEFORE INSERT OR UPDATE OF openid_preferred_username, openid_email, openid_given_name, openid_family_name
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.iam_credentials_update_full_text_search_index();

COMMENT ON TRIGGER iam_credentials_update_full_text_search_index ON public.iam_credentials
    IS 'trigger to update full_text_search column';