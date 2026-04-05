-- CreateTable
CREATE TABLE "DailyMetrics" (
    "date" DATE NOT NULL,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "qualified" INTEGER NOT NULL DEFAULT 0,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "consulted" INTEGER NOT NULL DEFAULT 0,
    "closed" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "adSpend" DECIMAL(10,2),
    "costPerLead" DECIMAL(10,2),
    "conversionRate" DECIMAL(5,4),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetrics_pkey" PRIMARY KEY ("date")
);
