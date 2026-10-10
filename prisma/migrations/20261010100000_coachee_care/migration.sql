-- CreateTable
CREATE TABLE "CoacheeCare" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoacheeCare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoacheeCareFile" (
    "id" SERIAL NOT NULL,
    "careId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" BIGINT NOT NULL,

    CONSTRAINT "CoacheeCareFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoacheeCare_userId_createdAt_idx" ON "CoacheeCare"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoacheeCareFile_key_key" ON "CoacheeCareFile"("key");

-- AddForeignKey
ALTER TABLE "CoacheeCare" ADD CONSTRAINT "CoacheeCare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoacheeCareFile" ADD CONSTRAINT "CoacheeCareFile_careId_fkey" FOREIGN KEY ("careId") REFERENCES "CoacheeCare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
