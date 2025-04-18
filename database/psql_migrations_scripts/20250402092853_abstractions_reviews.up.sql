-- abstractions_reviews table
CREATE TABLE public.abstractions_reviews
(
    abstractions_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    review_pass boolean NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    last_updated_on timestamp without time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY (abstractions_id, directory_id),
    CONSTRAINT abstractions_id FOREIGN KEY (abstractions_id)
        REFERENCES public.abstractions (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions_reviews
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_reviews
    IS 'Reviews on abstractions. Contributes towards the review_pass of the abstractions.';

-- abstractions_reviews_comments table
CREATE TABLE public.abstractions_reviews_comments
(
    id uuid NOT NULL DEFAULT uuid_generate_v7(),
    abstractions_id uuid NOT NULL,
    directory_id uuid NOT NULL,
    comment text NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    CONSTRAINT abstractions_id FOREIGN KEY (abstractions_id)
        REFERENCES public.abstractions (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT directory_id FOREIGN KEY (directory_id)
        REFERENCES public.directory (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

ALTER TABLE IF EXISTS public.abstractions_reviews_comments
    OWNER to pg_database_owner;

COMMENT ON TABLE public.abstractions_reviews_comments
    IS 'Comments on abstraction reviews';