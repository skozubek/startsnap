

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."decrement_support_count"("p_startsnap_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.startsnaps
  SET support_count = GREATEST(0, support_count - 1) -- Ensure count doesn't go below 0
  WHERE id = p_startsnap_id
  RETURNING support_count INTO new_count;
  
  RETURN new_count;
END;
$$;


ALTER FUNCTION "public"."decrement_support_count"("p_startsnap_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  initial_username TEXT;
  unique_username TEXT;
  random_suffix TEXT;
BEGIN
  initial_username := SPLIT_PART(NEW.email, '@', 1);
  unique_username := initial_username;

  -- Check if the initial username exists. If so, append a random suffix.
  -- This loop is a safeguard, but it will almost always run only once.
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    -- Generate a short random string (e.g., 4-6 alphanumeric characters)
    random_suffix := substr(md5(random()::text), 1, 6);
    unique_username := initial_username || '-' || random_suffix;
  END LOOP;

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, unique_username);

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_support_count"("p_startsnap_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.startsnaps
  SET support_count = support_count + 1
  WHERE id = p_startsnap_id
  RETURNING support_count INTO new_count;
  
  RETURN new_count;
END;
$$;


ALTER FUNCTION "public"."increment_support_count"("p_startsnap_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."feedback_replies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "parent_feedback_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feedback_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedbacks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "startsnap_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feedbacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "username" "text",
    "bio" "text",
    "status" "text" DEFAULT 'brainstorming'::"text",
    "github_url" "text",
    "twitter_url" "text",
    "linkedin_url" "text",
    "website_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_supporters" (
    "startsnap_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."project_supporters" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_supporters" IS 'Tracks which users have supported which startsnaps.';



COMMENT ON COLUMN "public"."project_supporters"."startsnap_id" IS 'Foreign key to the startsnap being supported.';



COMMENT ON COLUMN "public"."project_supporters"."user_id" IS 'Foreign key to the user who supported the startsnap.';



COMMENT ON COLUMN "public"."project_supporters"."created_at" IS 'Timestamp of when the support was given.';



CREATE TABLE IF NOT EXISTS "public"."startsnaps" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "type" "text" DEFAULT 'idea'::"text" NOT NULL,
    "thumbnail_url" "text",
    "live_demo_url" "text",
    "demo_video_url" "text",
    "tools_used" "text"[],
    "feedback_tags" "text"[],
    "is_hackathon_entry" boolean DEFAULT false,
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "support_count" integer DEFAULT 0 NOT NULL,
    "slug" "text"
);


ALTER TABLE "public"."startsnaps" OWNER TO "postgres";


COMMENT ON COLUMN "public"."startsnaps"."support_count" IS 'Stores the total number of users who have supported this startsnap.';



CREATE TABLE IF NOT EXISTS "public"."vibe_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "tags" "text"[],
    "status" "text" DEFAULT 'open'::"text",
    "type" "text" DEFAULT 'request'::"text",
    "linked_startsnap_id" "uuid",
    CONSTRAINT "vibe_requests_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in progress'::"text", 'completed'::"text"]))),
    CONSTRAINT "vibe_requests_type_check" CHECK (("type" = ANY (ARRAY['request'::"text", 'challenge'::"text"])))
);


ALTER TABLE "public"."vibe_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vibelogs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "startsnap_id" "uuid" NOT NULL,
    "log_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vibelogs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."feedback_replies"
    ADD CONSTRAINT "feedback_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."project_supporters"
    ADD CONSTRAINT "project_supporters_pkey" PRIMARY KEY ("startsnap_id", "user_id");



ALTER TABLE ONLY "public"."startsnaps"
    ADD CONSTRAINT "startsnaps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."startsnaps"
    ADD CONSTRAINT "startsnaps_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."vibe_requests"
    ADD CONSTRAINT "vibe_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vibelogs"
    ADD CONSTRAINT "vibelogs_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "update_feedback_replies_updated_at" BEFORE UPDATE ON "public"."feedback_replies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_feedbacks_updated_at" BEFORE UPDATE ON "public"."feedbacks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_startsnaps_updated_at" BEFORE UPDATE ON "public"."startsnaps" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_vibelogs_updated_at" BEFORE UPDATE ON "public"."vibelogs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."feedback_replies"
    ADD CONSTRAINT "feedback_replies_parent_feedback_id_fkey" FOREIGN KEY ("parent_feedback_id") REFERENCES "public"."feedbacks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback_replies"
    ADD CONSTRAINT "feedback_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_startsnap_id_fkey" FOREIGN KEY ("startsnap_id") REFERENCES "public"."startsnaps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_supporters"
    ADD CONSTRAINT "project_supporters_startsnap_id_fkey" FOREIGN KEY ("startsnap_id") REFERENCES "public"."startsnaps"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_supporters"
    ADD CONSTRAINT "project_supporters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."startsnaps"
    ADD CONSTRAINT "startsnaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vibe_requests"
    ADD CONSTRAINT "vibe_requests_linked_startsnap_id_fkey" FOREIGN KEY ("linked_startsnap_id") REFERENCES "public"."startsnaps"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vibe_requests"
    ADD CONSTRAINT "vibe_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."vibelogs"
    ADD CONSTRAINT "vibelogs_startsnap_id_fkey" FOREIGN KEY ("startsnap_id") REFERENCES "public"."startsnaps"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to insert feedback" ON "public"."feedbacks" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert replies" ON "public"."feedback_replies" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert vibe_requests" ON "public"."vibe_requests" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Allow authenticated users to read support status" ON "public"."project_supporters" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access to vibe_requests" ON "public"."vibe_requests" FOR SELECT USING (true);



CREATE POLICY "Allow public viewing of feedback replies" ON "public"."feedback_replies" FOR SELECT USING (true);



CREATE POLICY "Allow public viewing of feedbacks" ON "public"."feedbacks" FOR SELECT USING (true);



CREATE POLICY "Allow public viewing of profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow public viewing of startsnaps" ON "public"."startsnaps" FOR SELECT USING (true);



CREATE POLICY "Allow public viewing of vibelogs" ON "public"."vibelogs" FOR SELECT USING (true);



CREATE POLICY "Allow users to delete their own feedback" ON "public"."feedbacks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to delete their own replies" ON "public"."feedback_replies" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to delete their own startsnaps" ON "public"."startsnaps" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to delete their own vibe_requests" ON "public"."vibe_requests" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to delete vibelogs on their own startsnaps" ON "public"."vibelogs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."startsnaps"
  WHERE (("startsnaps"."id" = "vibelogs"."startsnap_id") AND ("startsnaps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own startsnaps" ON "public"."startsnaps" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert vibelogs on their own startsnaps" ON "public"."vibelogs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."startsnaps"
  WHERE (("startsnaps"."id" = "vibelogs"."startsnap_id") AND ("startsnaps"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to support a project" ON "public"."project_supporters" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Allow users to unsupport a project" ON "public"."project_supporters" FOR DELETE USING ((("auth"."uid"() = "user_id") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Allow users to update their own feedback" ON "public"."feedbacks" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own replies" ON "public"."feedback_replies" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own startsnaps" ON "public"."startsnaps" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own vibe_requests" ON "public"."vibe_requests" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update vibelogs on their own startsnaps" ON "public"."vibelogs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."startsnaps"
  WHERE (("startsnaps"."id" = "vibelogs"."startsnap_id") AND ("startsnaps"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."feedback_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedbacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_supporters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."startsnaps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vibe_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vibelogs" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_support_count"("p_startsnap_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_support_count"("p_startsnap_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_support_count"("p_startsnap_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_support_count"("p_startsnap_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_support_count"("p_startsnap_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_support_count"("p_startsnap_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."feedback_replies" TO "anon";
GRANT ALL ON TABLE "public"."feedback_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_replies" TO "service_role";



GRANT ALL ON TABLE "public"."feedbacks" TO "anon";
GRANT ALL ON TABLE "public"."feedbacks" TO "authenticated";
GRANT ALL ON TABLE "public"."feedbacks" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_supporters" TO "anon";
GRANT ALL ON TABLE "public"."project_supporters" TO "authenticated";
GRANT ALL ON TABLE "public"."project_supporters" TO "service_role";



GRANT ALL ON TABLE "public"."startsnaps" TO "anon";
GRANT ALL ON TABLE "public"."startsnaps" TO "authenticated";
GRANT ALL ON TABLE "public"."startsnaps" TO "service_role";



GRANT ALL ON TABLE "public"."vibe_requests" TO "anon";
GRANT ALL ON TABLE "public"."vibe_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."vibe_requests" TO "service_role";



GRANT ALL ON TABLE "public"."vibelogs" TO "anon";
GRANT ALL ON TABLE "public"."vibelogs" TO "authenticated";
GRANT ALL ON TABLE "public"."vibelogs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
