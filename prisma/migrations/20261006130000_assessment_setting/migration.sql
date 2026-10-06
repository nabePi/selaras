-- CreateTable
CREATE TABLE "AssessmentSetting" (
    "kind" "AssessmentKind" NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AssessmentSetting_pkey" PRIMARY KEY ("kind")
);
