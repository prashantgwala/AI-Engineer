const { pool } = require('../src/config/db');

const tables = [
  `CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'normal',
    department_id BIGINT,
    submitted_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS feedback (
    id BIGSERIAL PRIMARY KEY,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    submitted_by VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS meeting_minutes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meeting_date TIMESTAMPTZ NOT NULL,
    attendees TEXT,
    minutes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(150),
    size_bytes BIGINT,
    related_module VARCHAR(100),
    related_record_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    ai_mode VARCHAR(30) NOT NULL DEFAULT 'demo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS chat_message_feedback (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('helpful','not_helpful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id)
  )`,
  `CREATE TABLE IF NOT EXISTS complaint_status_history (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS file_movement_history (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    from_department_id BIGINT REFERENCES departments(id),
    to_department_id BIGINT REFERENCES departments(id),
    status VARCHAR(50),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS complaint_code VARCHAR(40) UNIQUE',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS category VARCHAR(120)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_summary TEXT',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(30)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS citizen_name VARCHAR(150)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(10)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS district_ward VARCHAR(150)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS address TEXT',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS uploaded_file_path TEXT',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_classification VARCHAR(120)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS suggested_department VARCHAR(150)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sentiment VARCHAR(30)',
  'ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolution_remarks TEXT',
  'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS conversation_id UUID',
  'ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS session_id UUID',
  'CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages(conversation_id, created_at)',
  'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS sentiment VARCHAR(30)',
  'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS topics TEXT',
  'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS ai_explanation TEXT',
  'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(30)',
  'ALTER TABLE meeting_minutes ADD COLUMN IF NOT EXISTS summary TEXT',
  'ALTER TABLE meeting_minutes ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(30)',
  'ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path TEXT',
  'ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(150)',
  'ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes BIGINT',
  'ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_text TEXT',
  'ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(30)',
  "ALTER TABLE files ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending'",
  'ALTER TABLE files ADD COLUMN IF NOT EXISTS department_id BIGINT REFERENCES departments(id)',
  'ALTER TABLE files ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ',
  'CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status)',
  'CREATE INDEX IF NOT EXISTS files_related_module_idx ON files(related_module)',
  'CREATE INDEX IF NOT EXISTS complaint_status_history_complaint_idx ON complaint_status_history(complaint_id)',
];

const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const statement of tables) {
      await client.query(statement);
    }
    await client.query('COMMIT');
    console.log('Database initialization completed.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

initializeDatabase();
