import {
  claimReminderEvent,
  releaseReminderEventClaim,
  markReminderEventSent,
} from '../service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

function splitTopLevelCommas(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) result.push(current);
  return result;
}

/**
 * In-Memory Mock Supabase Client that simulates PostgreSQL atomic UPDATE filters
 * (.eq, .is, .or, .update, .select) and the automatic updated_at trigger for CAS testing.
 */
function createSchedulerMockClient(initialRecords: Array<{
  id: string;
  status: string;
  reminder_sent_at: string | null;
  reminder_message_id: string | null;
  reminder_delivery_status: string | null;
  updated_at: string;
}>) {
  const store: Record<string, typeof initialRecords[0]> = {};
  for (const r of initialRecords) {
    store[r.id] = { ...r };
  }

  return {
    store,
    client: {
      from: (_tableName: string) => {
        return {
          update: (updateFields: Partial<typeof initialRecords[0]>) => {
            let targetId: string | null = null;
            let statusEq: string | null = null;
            let sentAtIsNull = false;
            let orFilterStr: string | null = null;
            let deliveryStatusEq: string | null = null;
            let updatedAtEq: string | null = null;

            const executeUpdate = () => {
              if (!targetId || !store[targetId]) {
                return { data: [], error: null };
              }

              const rec = store[targetId];

              // Validate SQL filters
              if (statusEq && rec.status !== statusEq) {
                return { data: [], error: null };
              }
              if (sentAtIsNull && rec.reminder_sent_at !== null) {
                return { data: [], error: null };
              }
              if (deliveryStatusEq && rec.reminder_delivery_status !== deliveryStatusEq) {
                return { data: [], error: null };
              }
              if (updatedAtEq && rec.updated_at !== updatedAtEq) {
                return { data: [], error: null };
              }

              // Evaluate .or() filter string if present
              if (orFilterStr) {
                let match = false;
                const parts = splitTopLevelCommas(orFilterStr);
                for (const part of parts) {
                  if (part === 'reminder_delivery_status.is.null' && rec.reminder_delivery_status === null) {
                    match = true;
                    break;
                  }
                  if (part.startsWith('and(') && part.endsWith(')')) {
                    const innerStr = part.slice(4, -1);
                    const subParts = splitTopLevelCommas(innerStr);
                    let allSubMatch = true;

                    for (const sub of subParts) {
                      if (sub.startsWith('reminder_delivery_status.eq.')) {
                        const expected = sub.replace('reminder_delivery_status.eq.', '');
                        if (rec.reminder_delivery_status !== expected) allSubMatch = false;
                      }
                      if (sub.startsWith('updated_at.lte.')) {
                        const thresholdIso = sub.replace('updated_at.lte.', '');
                        if (rec.updated_at > thresholdIso) allSubMatch = false;
                      }
                    }

                    if (allSubMatch) {
                      match = true;
                      break;
                    }
                  }
                }

                if (!match) {
                  return { data: [], error: null };
                }
              }

              // Apply atomic update & Postgres set_updated_at trigger behavior
              Object.assign(rec, updateFields);
              return { data: [{ id: rec.id, updated_at: rec.updated_at }], error: null };
            };

            const chain: any = {
              eq: (col: string, val: string) => {
                if (col === 'id') targetId = val;
                if (col === 'status') statusEq = val;
                if (col === 'reminder_delivery_status') deliveryStatusEq = val;
                if (col === 'updated_at') updatedAtEq = val;
                return chain;
              },
              is: (col: string, val: any) => {
                if (col === 'reminder_sent_at' && val === null) sentAtIsNull = true;
                return chain;
              },
              or: (orFilter: string) => {
                orFilterStr = orFilter;
                return chain;
              },
              select: async () => {
                return executeUpdate();
              },
              then: (onfulfilled: any) => {
                const res = executeUpdate();
                return Promise.resolve(res).then(onfulfilled);
              },
            };
            return chain;
          },
        };
      },
    },
  };
}

export async function runSchedulerConcurrencyTests() {
  console.log("=========================================================");
  console.log(" RUNNING SCHEDULER LEASE OWNERSHIP / CAS HARDENING TESTS ");
  console.log("=========================================================");

  const t1NowIso = "2026-09-04T10:00:00.000Z";
  const staleThresholdIso = "2026-09-04T09:55:00.000Z";

  // Test A: Worker A claims with lease T1
  const sim = createSchedulerMockClient([{
    id: "med-1",
    status: "pending",
    reminder_sent_at: null,
    reminder_message_id: null,
    reminder_delivery_status: null,
    updated_at: "2026-09-04T09:50:00.000Z",
  }]);

  const claimA = await claimReminderEvent(sim.client, "medication_events", "med-1", t1NowIso, staleThresholdIso);
  assert(claimA.success === true && !!claimA.leaseToken, "Test A: Worker A must successfully claim unsent event");
  const leaseT1 = claimA.leaseToken!;
  assert(leaseT1 === t1NowIso, "Test A: leaseToken T1 must match persisted updated_at");
  console.log("✓ Test A passed: Worker A claims event with lease T1");

  // Test B: Active second worker cannot claim
  const claimWorker2 = await claimReminderEvent(sim.client, "medication_events", "med-1", "2026-09-04T10:01:00.000Z", staleThresholdIso);
  assert(claimWorker2.success === false, "Test B: Active second worker cannot claim currently leased event");
  console.log("✓ Test B passed: Active second worker blocked from claiming lease T1");

  // Test C & D: After stale threshold Worker B reclaims with lease T2 (where T2 !== T1)
  const t2NowIso = "2026-09-04T10:10:00.000Z"; // 10 minutes later (Worker A hung)
  const t2StaleThresholdIso = "2026-09-04T10:05:00.000Z";

  const claimB = await claimReminderEvent(sim.client, "medication_events", "med-1", t2NowIso, t2StaleThresholdIso);
  assert(claimB.success === true && !!claimB.leaseToken, "Test C: Worker B must reclaim stale lease");
  const leaseT2 = claimB.leaseToken!;
  assert(leaseT2 === t2NowIso, "Test C: Worker B gets leaseToken T2");
  assert(leaseT2 !== leaseT1, "Test D: Lease token T2 must differ from T1");
  console.log("✓ Test C & D passed: Worker B reclaims stale lease with T2 !== T1");

  // Test E: Stale Worker A cannot release using T1
  const releaseA = await releaseReminderEventClaim(sim.client, "medication_events", "med-1", leaseT1);
  assert(releaseA.leaseLost === true, "Test E: Stale Worker A release using T1 must be rejected");
  assert(sim.store["med-1"].reminder_delivery_status === "pending", "Test E: Status must remain pending for Worker B");
  assert(sim.store["med-1"].updated_at === leaseT2, "Test E: updated_at must remain T2");
  console.log("✓ Test E passed: Stale Worker A cannot release lease using T1");

  // Test F: Stale Worker A cannot mark sent using T1
  const markSentA = await markReminderEventSent(sim.client, "medication_events", "med-1", "wamid.STALE_WORKER_A", leaseT1);
  assert(markSentA.leaseLost === true, "Test F: Stale Worker A markSent using T1 must be rejected");
  assert(sim.store["med-1"].reminder_message_id === null, "Test F: reminder_message_id must NOT be overwritten by Worker A");
  console.log("✓ Test F passed: Stale Worker A cannot mark sent using T1");

  // Test G: Worker B can mark sent using T2
  const markSentB = await markReminderEventSent(sim.client, "medication_events", "med-1", "wamid.WORKER_B_SUCCESS", leaseT2);
  assert(markSentB.success === true && !markSentB.leaseLost, "Test G: Worker B markSent using T2 must succeed");
  assert(sim.store["med-1"].reminder_delivery_status === "sent", "Test G: Status updated to 'sent' by Worker B");
  assert(sim.store["med-1"].reminder_message_id === "wamid.WORKER_B_SUCCESS", "Test G: MessageId updated by Worker B");
  console.log("✓ Test G passed: Worker B marks sent using valid lease T2");

  // Test H: Already-sent event cannot be reclaimed
  const reclaimSent = await claimReminderEvent(sim.client, "medication_events", "med-1", "2026-09-04T10:15:00.000Z", t2StaleThresholdIso);
  assert(reclaimSent.success === false, "Test H: Already-sent event cannot be reclaimed");
  console.log("✓ Test H passed: Already-sent event cannot be reclaimed");

  // Test I: Routine and medication tables use identical lease ownership rules
  const simRoutine = createSchedulerMockClient([{
    id: "routine-101",
    status: "pending",
    reminder_sent_at: null,
    reminder_message_id: null,
    reminder_delivery_status: null,
    updated_at: "2026-09-04T09:50:00.000Z",
  }]);

  const claimRoutine = await claimReminderEvent(simRoutine.client, "care_routine_events", "routine-101", t1NowIso, staleThresholdIso);
  assert(claimRoutine.success === true && !!claimRoutine.leaseToken, "Test I: Routine table claim failed");
  const routineToken = claimRoutine.leaseToken!;

  const markSentRoutine = await markReminderEventSent(simRoutine.client, "care_routine_events", "routine-101", "wamid.ROUTINE_CAS", routineToken);
  assert(markSentRoutine.success === true && !markSentRoutine.leaseLost, "Test I: Routine table markSent failed");
  assert(simRoutine.store["routine-101"].reminder_delivery_status === "sent", "Test I: Routine status updated to 'sent'");
  console.log("✓ Test I passed: Routine and medication tables use identical CAS lease rules");

  // Test J: Normal failure by the CURRENT owner can release its own lease
  const simFail = createSchedulerMockClient([{
    id: "med-fail",
    status: "pending",
    reminder_sent_at: null,
    reminder_message_id: null,
    reminder_delivery_status: null,
    updated_at: "2026-09-04T09:50:00.000Z",
  }]);

  const claimFail = await claimReminderEvent(simFail.client, "medication_events", "med-fail", t1NowIso, staleThresholdIso);
  assert(claimFail.success === true && !!claimFail.leaseToken, "Test J: Claim before failure failed");

  const releaseOwner = await releaseReminderEventClaim(simFail.client, "medication_events", "med-fail", claimFail.leaseToken!);
  assert(releaseOwner.success === true && !releaseOwner.leaseLost, "Test J: Current owner release failed");
  assert(simFail.store["med-fail"].reminder_delivery_status === null, "Test J: Status restored to null for retry");
  console.log("✓ Test J passed: Normal failure by current owner releases lease for retry");

  console.log("=========================================================");
  console.log(" ALL SCHEDULER CAS LEASE OWNERSHIP TESTS PASSED          ");
  console.log("=========================================================");
}
