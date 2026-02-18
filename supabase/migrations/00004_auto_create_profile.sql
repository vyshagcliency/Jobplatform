-- Automatically create a profile row when a new user signs up.
-- Runs as SECURITY DEFINER to bypass RLS (the user isn't fully
-- authenticated until they confirm their email via OTP).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, onboarding_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'candidate'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'pending'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
