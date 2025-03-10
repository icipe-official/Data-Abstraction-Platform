-- iam_group_authorizations_ids table
CREATE TABLE public.iam_group_authorizations_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT iam_group_authorizations_id FOREIGN KEY (id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID, 
    CONSTRAINT creation_iam_group_authorizations_id FOREIGN KEY (creation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT deactivation_iam_group_authorization_id FOREIGN KEY (deactivation_iam_group_authorizations_id)
        REFERENCES public.iam_group_authorizations (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

ALTER TABLE IF EXISTS public.iam_group_authorizations_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.iam_group_authorizations_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';


-- group_rule_authorizations_ids table
CREATE TABLE public.group_rule_authorizations_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT group_rule_authorizations_id FOREIGN KEY (id)
        REFERENCES public.group_rule_authorizations (id) MATCH SIMPLE
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

ALTER TABLE IF EXISTS public.group_rule_authorizations_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.group_rule_authorizations_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- directory_groups_authorization_ids table
CREATE TABLE public.directory_groups_authorization_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT directory_groups_authorizations_id FOREIGN KEY (id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
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

ALTER TABLE IF EXISTS public.directory_groups_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.directory_groups_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';

-- directory_authorization_ids table
CREATE TABLE public.directory_authorization_ids
(
    id uuid NOT NULL,
    creation_iam_group_authorizations_id uuid,
    deactivation_iam_group_authorizations_id uuid,
    PRIMARY KEY (id),
    CONSTRAINT directory_authorizations_id FOREIGN KEY (id)
        REFERENCES public.directory (id) MATCH SIMPLE
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

ALTER TABLE IF EXISTS public.directory_authorization_ids
    OWNER to pg_database_owner;

COMMENT ON TABLE public.directory_authorization_ids
    IS 'authorization ids that were used to create and/or deactivate the resources';