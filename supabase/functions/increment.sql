
-- Create function to increment a value
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement a value
CREATE OR REPLACE FUNCTION decrement(x integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, x - 1);
END;
$$ LANGUAGE plpgsql;
