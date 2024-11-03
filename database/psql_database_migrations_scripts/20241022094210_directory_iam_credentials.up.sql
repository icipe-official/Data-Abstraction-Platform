-- directory table
CREATE TABLE public.directory
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_groups_id uuid NOT NULL,
    metadata_model_default_id text NOT NULL DEFAULT 'directory'::text,
    data jsonb,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id),
    CONSTRAINT metadata_model_default_id FOREIGN KEY (metadata_model_default_id)
        REFERENCES public.metadata_models_defaults (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
        NOT VALID,
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

-- iam_ticket_types table
CREATE TABLE public.iam_ticket_types
(
    id text NOT NULL,
    description text NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.iam_ticket_types
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_ticket_types
    IS 'Ticket types for iam requests';

-- iam credentials table
CREATE TABLE public.iam_credentials
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_groups_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    username text,
    email text,
    email_verified_on timestamp without time zone,
    passcode text,
    iam_ticket_type_id text,
    ticket_number text,
    pin text,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (id),
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT group_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT iam_credentials_unique UNIQUE NULLS NOT DISTINCT (username, email),
    CONSTRAINT iam_ticket_type_id FOREIGN KEY (iam_ticket_type_id)
        REFERENCES public.iam_ticket_types (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
        NOT VALID    
);

ALTER TABLE IF EXISTS public.iam_credentials
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_credentials
    IS 'Credentials for authentication';

COMMENT ON CONSTRAINT iam_credentials_unique ON public.iam_credentials
    IS 'username, and email should be unique';

-- trigger to update iam_credentials->last_updated_on column
CREATE TRIGGER iam_credentials_update_last_updated_on
    BEFORE UPDATE OF email, email_verified_on, passcode, iam_ticket_type_id, ticket_number, pin
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER iam_credentials_update_last_updated_on ON public.iam_credentials
    IS 'update timestamp upon update on relevant columns';

-- function to generate passcode salt
CREATE FUNCTION public.iam_credentials_gen_passcode_salt()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
BEGIN
	IF LENGTH(NEW.passcode) > 0 THEN
		NEW.passcode = crypt(NEW.passcode, gen_salt('bf'));
    END IF;	
	RETURN NEW;
END
$BODY$;

ALTER FUNCTION public.iam_credentials_gen_passcode_salt()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.iam_credentials_gen_passcode_salt()
    IS 'Generate passcode hash when the passcode is updated';

CREATE TRIGGER iam_credentials_gen_passcode_salt
    BEFORE INSERT OR UPDATE OF passcode
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.iam_credentials_gen_passcode_salt();

COMMENT ON TRIGGER iam_credentials_gen_passcode_salt ON public.iam_credentials
    IS 'trigger to compute passcode salt';

-- function to generate pin salt
CREATE FUNCTION public.iam_credentials_gen_pin_salt()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
	IF LENGTH(NEW.pin) > 0 THEN
		NEW.pin = crypt(NEW.pin, gen_salt('bf'));
    END IF;
	RETURN NEW;
END
$BODY$;

ALTER FUNCTION public.iam_credentials_gen_pin_salt()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.iam_credentials_gen_pin_salt()
    IS 'Generate pin hash when a pin and ticket is generated';

CREATE OR REPLACE TRIGGER iam_credentials_gen_pin_salt
    BEFORE UPDATE OF pin
    ON public.iam_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.iam_credentials_gen_pin_salt();

COMMENT ON TRIGGER iam_credentials_gen_pin_salt ON public.iam_credentials
    IS 'trigger to compute pin salt';