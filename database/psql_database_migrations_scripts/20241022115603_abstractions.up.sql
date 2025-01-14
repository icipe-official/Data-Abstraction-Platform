-- abstractions_directory_groups table
CREATE TABLE public.abstractions_directory_groups
(
    directory_groups_id uuid NOT NULL,
    metadata_models_id uuid NOT NULL,
    description text,
    abstraction_review_quorum integer DEFAULT 0,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    PRIMARY KEY (directory_groups_id),
    CONSTRAINT directory_groups_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT metadata_models_id FOREIGN KEY (metadata_models_id)
        REFERENCES public.metadata_models (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions_directory_groups
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_directory_groups
    IS 'setup abstractions properties for group';

-- abstractions_directory_groups trigger to update last_updated_on column
CREATE TRIGGER abstractions_directory_groups_update_last_updated_on
    BEFORE UPDATE OF description, abstraction_review_quorum
    ON public.abstractions_directory_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER abstractions_directory_groups_update_last_updated_on ON public.abstractions_directory_groups
    IS 'update timestamp upon update on relevant columns';

-- abstractions_directory_groups_authorization_ids table
CREATE TABLE public.abstractions_directory_groups_authorization_ids
(
    directory_groups_id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (directory_groups_id),
    CONSTRAINT directory_groups_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.abstractions_directory_groups (directory_groups_id) MATCH SIMPLE
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

ALTER TABLE IF EXISTS public.abstractions_directory_groups_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_directory_groups_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- abstractions table
CREATE TABLE public.abstractions
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    directory_groups_id uuid NOT NULL,
    metadata_models_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    storage_files_id uuid NOT NULL,
    tags text[],
    data json,
    abstractions_reviews_pass boolean DEFAULT FALSE,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id),
    CONSTRAINT directory_groups_id FOREIGN KEY (directory_groups_id)
        REFERENCES public.abstractions_directory_groups (directory_groups_id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT metadata_models_id FOREIGN KEY (metadata_models_id)
        REFERENCES public.metadata_models (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT storage_files_id FOREIGN KEY (storage_files_id)
        REFERENCES public.storage_files (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions
    IS 'data abstraction';

-- abstractions trigger to update last_updated_on column
CREATE TRIGGER abstractions_update_last_updated_on
    BEFORE UPDATE OF directory_id, tags, data, abstractions_reviews_pass
    ON public.abstractions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER abstractions_update_last_updated_on ON public.abstractions
    IS 'update timestamp upon update on relevant columns';

-- function and trigger to update abstractions->full_text_search
CREATE FUNCTION public.abstractions_update_full_text_search_index()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
DECLARE tags text[];

BEGIN
	IF array_length(NEW.tags,1) > 0 THEN
		tags = NEW.tags;
	ELSE
        IF OLD.tags IS NOT NULL THEN
		    tags = OLD.tags;
        ELSE
            tags = '{}';
        END IF;
	END IF;

    NEW.full_text_search = setweight(to_tsvector(coalesce(array_to_string(tags,' ','*'),'')),'A');
    	
	RETURN NEW;   
END
$BODY$;

ALTER FUNCTION public.abstractions_update_full_text_search_index()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.abstractions_update_full_text_search_index()
    IS 'Update full_text_search column in abstractions when tags change';

CREATE TRIGGER abstractions_update_full_text_search_index
    BEFORE INSERT OR UPDATE OF tags
    ON public.abstractions
    FOR EACH ROW
    EXECUTE FUNCTION public.abstractions_update_full_text_search_index();

COMMENT ON TRIGGER abstractions_update_full_text_search_index ON public.abstractions
    IS 'trigger to update full_text_search column';

-- abstractions_authorization_ids table
CREATE TABLE public.abstractions_authorization_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT abstractions_id FOREIGN KEY (id)
        REFERENCES public.abstractions (id) MATCH SIMPLE
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

ALTER TABLE IF EXISTS public.abstractions_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- abstractions_reviews table
CREATE TABLE public.abstractions_reviews
(
    abstractions_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    pass boolean NOT NULL DEFAULT FALSE,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    creation_iam_group_authorizations_id uuid,
    PRIMARY KEY (abstractions_id, directory_id),
    CONSTRAINT abstractions_id FOREIGN KEY (abstractions_id)
        REFERENCES public.abstractions (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions_reviews
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_reviews
    IS 'reviews on abstractions.';

-- abstractions_reviews_comments table
CREATE TABLE public.abstractions_reviews_comments
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    abstractions_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    comment json NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    creation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT abstractions_id FOREIGN KEY (abstractions_id)
        REFERENCES public.abstractions (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT creation_iam_group_authorizations_id FOREIGN KEY (creation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions_reviews_comments
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_reviews_comments
    IS 'comments on abstraction reviews';