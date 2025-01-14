-- directory_groups table
CREATE TABLE public.directory_groups
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    data jsonb,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    deactivated_on timestamp without time zone,
    full_text_search tsvector,
    PRIMARY KEY (id)
);

COMMENT ON TABLE public.directory_groups
    IS 'Group for users created by different people in the system that serve a common purpose.';

CREATE INDEX directory_groups_full_text_search_index
    ON public.directory_groups USING gin
    (full_text_search);

CREATE INDEX directory_groups_data_jsonb_index
    ON public.directory_groups USING gin
    (data);

-- directory_groups trigger to update last_updated_on column
CREATE TRIGGER directory_groups_update_last_updated_on
    BEFORE UPDATE OF data
    ON public.directory_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_on();

COMMENT ON TRIGGER directory_groups_update_last_updated_on ON public.directory_groups
    IS 'update timestamp upon update on relevant columns';

-- directory_groups_sub_groups table
CREATE TABLE public.directory_groups_sub_groups
(
    parent_group_id uuid NOT NULL,
    sub_group_id uuid NOT NULL,
    PRIMARY KEY (parent_group_id, sub_group_id),
    CONSTRAINT group_id FOREIGN KEY (parent_group_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT sub_group_id FOREIGN KEY (sub_group_id)
        REFERENCES public.directory_groups (id) MATCH SIMPLE
        ON UPDATE RESTRICT
        ON DELETE RESTRICT
        NOT VALID
);

COMMENT ON TABLE public.directory_groups_sub_groups
    IS 'Links sub_groups to their parent_groups';