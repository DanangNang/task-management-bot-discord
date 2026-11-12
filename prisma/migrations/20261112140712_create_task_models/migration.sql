-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardChannelId" TEXT,
    "dailyBoardMessageId" TEXT,
    "dailyUpdateTime" TEXT NOT NULL DEFAULT '08:00',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "discordUserId" TEXT NOT NULL,
    CONSTRAINT "TaskMember_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskMember_taskId_discordUserId_key" ON "TaskMember"("taskId", "discordUserId");
