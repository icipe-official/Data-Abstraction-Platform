-- will be used to generate uuid version 4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- postigs extension
-- CREATE EXTENSION postgis;

-- will be used to generate password hashes
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- function to update last_updated_on column
CREATE FUNCTION public.update_last_updated_on()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    NOT LEAKPROOF
AS $BODY$
BEGIN
    NEW.last_updated_on=NOW();
    RETURN NEW;
END
$BODY$;

ALTER FUNCTION public.update_last_updated_on()
    OWNER TO pg_database_owner;

COMMENT ON FUNCTION public.update_last_updated_on()
    IS 'update last_updated_on column when relevant columns in a particular row are updated';

-- function to generate uuidv7
CREATE FUNCTION public.uuid_generate_v7()
    RETURNS uuid
AS $$
SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid())
                placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
                from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex')::uuid;
$$
LANGUAGE SQL
VOLATILE;