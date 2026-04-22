CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email varchar(100) NOT NULL,
  recipient_name varchar(200),
  recipient_role varchar(50),
  email_type varchar(50) NOT NULL,
  subject varchar(500) NOT NULL,
  content text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs (recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs (status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);

