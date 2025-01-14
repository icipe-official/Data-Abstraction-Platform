-- directory table
CREATE TABLE public.directory
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_groups_id uuid NOT NULL,
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
    BEFORE UPDATE OF data
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
    openid_preferred_username text NOT NULL UNIQUE,
    openid_email text NOT NULL,
    openid_email_verified bool,
    openid_given_name text,
    openid_family_name text,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
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

-- trigger to update iam_credentials->last_updated_on column
CREATE TRIGGER iam_credentials_update_last_updated_on
    BEFORE UPDATE OF directory_id, openid_sub, openid_preferred_username, openid_email, openid_email_verified, openid_given_name, openid_family_name
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER iam_credentials_update_last_updated_on ON public.iam_credentials
    IS 'update timestamp upon update on relevant columns';

-- iam_credentials_sessions table
CREATE TABLE public.iam_credentials_sessions
(
    openid_sid uuid NOT NULL,
    openid_sub uuid NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    expires_on timestamp without time zone NOT NULL,
    PRIMARY KEY (openid_sid),
    CONSTRAINT openid_sub FOREIGN KEY (openid_sub)
        REFERENCES public.iam_credentials (openid_sub) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID 
);

ALTER TABLE IF EXISTS public.iam_credentials_sessions
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_credentials_sessions
    IS 'Login sessions';