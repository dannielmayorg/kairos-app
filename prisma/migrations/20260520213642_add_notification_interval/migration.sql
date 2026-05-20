-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "intervaloNotificacion" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "ultimaNotificacion" TIMESTAMP(3);
