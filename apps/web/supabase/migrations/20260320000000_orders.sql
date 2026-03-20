-- Orders table for Breeze Man Books signed copy purchases
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_title text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  buyer_name text NOT NULL DEFAULT '',
  buyer_email text NOT NULL DEFAULT '',
  buyer_address text NOT NULL DEFAULT '',
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read orders (no public access needed)
CREATE POLICY "Service role full access" ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anon to insert (for webhook)
CREATE POLICY "Anon can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);
