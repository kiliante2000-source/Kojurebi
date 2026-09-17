import 'dotenv/config';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-kojurebi-ci-123456';
process.env.DATABASE_URL = 'file:./test.db';
process.env.CORS_ORIGIN ||= 'http://127.0.0.1:45321';
process.env.FRONTEND_URL ||= 'http://127.0.0.1:45321';
process.env.UPLOAD_DIR ||= './uploads';
process.env.COOKIE_NAME ||= 'kojurebi_token';
