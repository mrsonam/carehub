-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAY_AT_COUNTER', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "feeAmountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateTable
CREATE TABLE "ClinicFeeSchedule" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "fee15Cents" INTEGER NOT NULL DEFAULT 5000,
    "fee30Cents" INTEGER NOT NULL DEFAULT 8000,
    "fee45Cents" INTEGER NOT NULL DEFAULT 11000,
    "fee60Cents" INTEGER NOT NULL DEFAULT 14000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicFeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_stripeCheckoutSessionId_key" ON "Appointment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_stripePaymentIntentId_key" ON "Appointment"("stripePaymentIntentId");
