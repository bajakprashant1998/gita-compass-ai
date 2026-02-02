-- Add setting for donate button visibility
INSERT INTO admin_settings (key, value, description, is_secret)
VALUES ('show_donate_button', 'true', 'Show or hide the donate button in the header navigation', false)
ON CONFLICT (key) DO NOTHING;