export const BUNDLED_MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "track" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'youtube',
    "platformNote" TEXT NOT NULL DEFAULT '',
    "dailyHours" REAL NOT NULL,
    "target" TEXT NOT NULL DEFAULT '',
    "weakSubjects" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "StudyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "minutes" INTEGER NOT NULL DEFAULT 40,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "topicKey" TEXT NOT NULL DEFAULT '',
    "weekNumber" INTEGER NOT NULL DEFAULT 0,
    "targetQuestions" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "wrong" INTEGER NOT NULL DEFAULT 0,
    "blank" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");
  CREATE INDEX IF NOT EXISTS "StudyTask_userId_date_idx" ON "StudyTask"("userId", "date");
  CREATE INDEX IF NOT EXISTS "StudyTask_userId_source_idx" ON "StudyTask"("userId", "source");
  CREATE TABLE IF NOT EXISTS "StickyNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StickyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "TodoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodoItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
  CREATE INDEX IF NOT EXISTS "StickyNote_userId_idx" ON "StickyNote"("userId");
  CREATE INDEX IF NOT EXISTS "TodoItem_userId_idx" ON "TodoItem"("userId");`,
];

export const STUDY_TASK_ALTERS = [
  `ALTER TABLE "StudyTask" ADD COLUMN "topicKey" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "StudyTask" ADD COLUMN "weekNumber" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "StudyTask" ADD COLUMN "targetQuestions" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "StudyTask" ADD COLUMN "correct" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "StudyTask" ADD COLUMN "wrong" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "StudyTask" ADD COLUMN "blank" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "StudyTask" ADD COLUMN "note" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "StudyTask" ADD COLUMN "source" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "StudyTask" ADD COLUMN "elapsedSeconds" INTEGER NOT NULL DEFAULT 0`,
  `CREATE INDEX IF NOT EXISTS "StudyTask_userId_date_idx" ON "StudyTask"("userId", "date")`,
  `CREATE INDEX IF NOT EXISTS "StudyTask_userId_source_idx" ON "StudyTask"("userId", "source")`,
];

export const EXTRA_TABLES = [
  `CREATE TABLE IF NOT EXISTS "StickyNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StickyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "TodoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodoItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "StickyNote_userId_idx" ON "StickyNote"("userId")`,
  `CREATE INDEX IF NOT EXISTS "TodoItem_userId_idx" ON "TodoItem"("userId")`,
];
