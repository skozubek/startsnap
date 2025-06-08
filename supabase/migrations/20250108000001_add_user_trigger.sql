-- Migration to add the missing trigger for handle_new_user function
-- This trigger will be called whenever a new user is inserted into auth.users

CREATE OR REPLACE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."handle_new_user"();