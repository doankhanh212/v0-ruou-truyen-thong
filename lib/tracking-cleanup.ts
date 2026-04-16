import { db } from "@/lib/db";

/**
 * Delete tracking logs older than the specified number of days.
 * Call this from an admin endpoint or a scheduled task when ready.
 */
export async function cleanupOldTrackingLogs(days: number = 30): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const result = await db.trackingLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return result.count;
}
