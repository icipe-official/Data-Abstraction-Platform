-- group_authorization_rules table
CREATE TABLE public.group_authorization_rules
(
    id text NOT NULL,
    rule_group text NOT NULL,
    description text NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    full_text_search tsvector,
    PRIMARY KEY (id, rule_group)
);

ALTER TABLE IF EXISTS public.group_authorization_rules
    OWNER to pg_database_owner;

COMMENT ON TABLE public.group_authorization_rules
    IS 'Authorization rules available to users in a group';

CREATE INDEX group_authorization_rules_full_text_search_index
    ON public.group_authorization_rules USING gin
    (full_text_search);

-- trigger to update group_authorization_rules->last_updated_on column
CREATE TRIGGER group_authorization_rules_update_last_updated_on
    BEFORE UPDATE OF id, description, rule_group
    ON public.group_authorization_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER group_authorization_rules_update_last_updated_on ON public.group_authorization_rules
    IS 'update timestamp upon update on relevant columns';

-- function and trigger to update group_authorization_rules->full_text_search
CREATE FUNCTION public.group_authorization_rules_update_full_text_search_index()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
DECLARE id text;
DECLARE rule_group text;
DECLARE description text;
BEGIN
	IF NEW.id IS DISTINCT FROM OLD.id THEN
		id = NEW.id;
	ELSE
		id = OLD.id;
	END IF;
	IF NEW.description IS DISTINCT FROM OLD.description THEN
		description = NEW.description;
	ELSE
		description = OLD.description;
	END IF;
    IF NEW.rule_group IS DISTINCT FROM OLD.rule_group THEN
		rule_group = NEW.rule_group;
	ELSE
		rule_group = OLD.rule_group;
	END IF;

    NEW.full_text_search = 
        setweight(to_tsvector(coalesce(id,'')),'A') ||        
        setweight(to_tsvector(coalesce(rule_group,'')),'B') ||
        setweight(to_tsvector(coalesce(description,'')),'C');
    	
	RETURN NEW;   
END
$BODY$;

ALTER FUNCTION public.group_authorization_rules_update_full_text_search_index()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.group_authorization_rules_update_full_text_search_index()
    IS 'Update full_text_search column in group_authorization_rules when id, rule_group, and description change';

CREATE TRIGGER group_authorization_rules_update_full_text_search_index
    BEFORE INSERT OR UPDATE OF id, rule_group, description
    ON public.group_authorization_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.group_authorization_rules_update_full_text_search_index();

COMMENT ON TRIGGER group_authorization_rules_update_full_text_search_index ON public.group_authorization_rules
    IS 'trigger to update full_text_search column';

-- group_rule_authorizations table
CREATE TABLE public.group_rule_authorizations
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(), 
    directory_groups_id uuid NOT NULL,
    group_authorization_rules_id text NOT NULL,
    group_authorization_rules_group text NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (id),
    CONSTRAINT group_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT group_authorization_rules_id FOREIGN KEY (group_authorization_rules_id, group_authorization_rules_group)
        REFERENCES public.group_authorization_rules (id, rule_group) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

ALTER TABLE IF EXISTS public.group_rule_authorizations
    OWNER to pg_database_owner;

COMMENT ON TABLE public.group_rule_authorizations
    IS 'Authorization rules available to users in a group';

-- iam_group_authorizations
CREATE TABLE public.iam_group_authorizations
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    iam_credentials_id uuid NOT NULL,
    group_rule_authorizations_id uuid NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (id),
    CONSTRAINT iam_credentials_id FOREIGN KEY (iam_credentials_id)
        REFERENCES public.iam_credentials (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT group_rule_authorizations_id FOREIGN KEY (group_rule_authorizations_id)
        REFERENCES public.group_rule_authorizations (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

ALTER TABLE IF EXISTS public.iam_group_authorizations
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_group_authorizations
    IS 'authorization rules for users in a directory_group';