import {
  shouldUpdateDeliveryStatus,
  handleWhatsAppDeliveryStatusUpdate,
  getGuardedStatusUpdateFilter,
  WhatsAppDeliveryStatus
} from '../status';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

/**
 * In-Memory Simulated Supabase Client that enforces PostgREST `.or(...)` filter rules
 * exactly like Postgres/PostgREST does in production to test persistence concurrency & atomicity.
 */
function createSimulatedPostgrestClient(initialDbState: Record<string, { id: string; reminder_message_id: string; reminder_delivery_status: string | null }>) {
  const records = { ...initialDbState };

  return {
    records,
    client: {
      from: (tableName: string) => {
        return {
          select: () => ({
            eq: (colName: string, val: string) => ({
              maybeSingle: async () => {
                const foundKey = Object.keys(records).find(k => records[k][colName as keyof typeof records[typeof k]] === val);
                if (foundKey) {
                  const rec = records[foundKey];
                  return { data: { id: rec.id, reminder_delivery_status: rec.reminder_delivery_status }, error: null };
                }
                return { data: null, error: null };
              },
            }),
          }),
          update: (updateFields: { reminder_delivery_status: WhatsAppDeliveryStatus }) => {
            let targetId: string | null = null;
            let filterStr: string | null = null;

            const chain = {
              eq: (_col: string, idVal: string) => {
                targetId = idVal;
                return chain;
              },
              or: (orFilter: string) => {
                filterStr = orFilter;
                return chain;
              },
              select: async () => {
                const foundKey = Object.keys(records).find(k => records[k].id === targetId);
                if (!targetId || !foundKey) {
                  return { data: [], error: null };
                }
                const currentRecord = records[foundKey];
                const currentStatus = currentRecord.reminder_delivery_status;

                // Evaluate PostgREST filter
                let filterMatched = false;
                if (filterStr) {
                  const conditions = filterStr.split(',');
                  for (const cond of conditions) {
                    if (cond === 'reminder_delivery_status.is.null' && (currentStatus === null || currentStatus === undefined)) {
                      filterMatched = true;
                      break;
                    }
                    if (cond.startsWith('reminder_delivery_status.eq.')) {
                      const expectedVal = cond.replace('reminder_delivery_status.eq.', '');
                      if (currentStatus === expectedVal) {
                        filterMatched = true;
                        break;
                      }
                    }
                  }
                } else {
                  filterMatched = true;
                }

                if (filterMatched) {
                  // Perform atomic update in DB
                  currentRecord.reminder_delivery_status = updateFields.reminder_delivery_status;
                  return { data: [{ id: currentRecord.id, reminder_delivery_status: currentRecord.reminder_delivery_status }], error: null };
                } else {
                  // PostgREST filter condition failed: 0 rows updated
                  return { data: [], error: null };
                }
              },
            };
            return chain;
          },
        };
      },
    },
  };
}

export async function runDeliveryStatusTests() {
  console.log("=================================================");
  console.log(" RUNNING WHATSAPP DELIVERY STATUS ATOMICITY TESTS");
  console.log("=================================================");

  // ----------------------------------------------------
  // SECTION 1: Pure Transition Helper Tests (A - J)
  // ----------------------------------------------------

  // Test A: pending -> sent
  {
    const res = shouldUpdateDeliveryStatus('pending', 'sent');
    assert(res.shouldUpdate === true && res.nextStatus === 'sent', "Test A: pending -> sent failed");
    console.log("✓ Test A passed: pending -> sent transition allowed");
  }

  // Test B: sent -> delivered
  {
    const res = shouldUpdateDeliveryStatus('sent', 'delivered');
    assert(res.shouldUpdate === true && res.nextStatus === 'delivered', "Test B: sent -> delivered failed");
    console.log("✓ Test B passed: sent -> delivered transition allowed");
  }

  // Test C: delivered -> read
  {
    const res = shouldUpdateDeliveryStatus('delivered', 'read');
    assert(res.shouldUpdate === true && res.nextStatus === 'read', "Test C: delivered -> read failed");
    console.log("✓ Test C passed: delivered -> read transition allowed");
  }

  // Test D: read cannot be overwritten by delivered
  {
    const res = shouldUpdateDeliveryStatus('read', 'delivered');
    assert(res.shouldUpdate === false, "Test D: read cannot be overwritten by delivered");
    console.log("✓ Test D passed: read cannot be overwritten by delivered");
  }

  // Test E: read cannot be overwritten by sent
  {
    const res = shouldUpdateDeliveryStatus('read', 'sent');
    assert(res.shouldUpdate === false, "Test E: read cannot be overwritten by sent");
    console.log("✓ Test E passed: read cannot be overwritten by sent");
  }

  // Test F: delivered cannot be overwritten by failed
  {
    const res = shouldUpdateDeliveryStatus('delivered', 'failed');
    assert(res.shouldUpdate === false, "Test F: delivered cannot be overwritten by failed");
    console.log("✓ Test F passed: delivered cannot be overwritten by failed");
  }

  // Test G: failed may advance to delivered
  {
    const res = shouldUpdateDeliveryStatus('failed', 'delivered');
    assert(res.shouldUpdate === true && res.nextStatus === 'delivered', "Test G: failed -> delivered failed");
    console.log("✓ Test G passed: failed may advance to delivered");
  }

  // Test H: failed may advance to read
  {
    const res = shouldUpdateDeliveryStatus('failed', 'read');
    assert(res.shouldUpdate === true && res.nextStatus === 'read', "Test H: failed -> read failed");
    console.log("✓ Test H passed: failed may advance to read");
  }

  // Test I: sent may become failed
  {
    const res = shouldUpdateDeliveryStatus('sent', 'failed');
    assert(res.shouldUpdate === true && res.nextStatus === 'failed', "Test I: sent -> failed failed");
    console.log("✓ Test I passed: sent may become failed");
  }

  // Test J: duplicate status is harmless
  {
    const resSent = shouldUpdateDeliveryStatus('sent', 'sent');
    assert(resSent.shouldUpdate === false, "Test J1: duplicate sent must be false");

    const resDelivered = shouldUpdateDeliveryStatus('delivered', 'delivered');
    assert(resDelivered.shouldUpdate === false, "Test J2: duplicate delivered must be false");

    const resRead = shouldUpdateDeliveryStatus('read', 'read');
    assert(resRead.shouldUpdate === false, "Test J3: duplicate read must be false");

    console.log("✓ Test J passed: duplicate statuses are harmless no-ops");
  }

  // ----------------------------------------------------
  // SECTION 2: Guarded Persistence & Concurrency Tests
  // ----------------------------------------------------

  // Filter String Correctness
  {
    assert(getGuardedStatusUpdateFilter('sent') === 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending', "Filter 'sent' mismatch");
    assert(getGuardedStatusUpdateFilter('delivered') === 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent,reminder_delivery_status.eq.failed', "Filter 'delivered' mismatch");
    assert(getGuardedStatusUpdateFilter('read') === 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent,reminder_delivery_status.eq.delivered,reminder_delivery_status.eq.failed', "Filter 'read' mismatch");
    assert(getGuardedStatusUpdateFilter('failed') === 'reminder_delivery_status.is.null,reminder_delivery_status.eq.pending,reminder_delivery_status.eq.sent', "Filter 'failed' mismatch");
    console.log("✓ Filter string generator correctly builds PostgREST atomic update guards");
  }

  // Simulated Race Condition Test (Simulating Webhook A 'delivered' vs Webhook B 'read')
  {
    const msgId = "wamid.RACE123";
    const sim = createSimulatedPostgrestClient({
      rec1: { id: "med-event-uuid-1", reminder_message_id: msgId, reminder_delivery_status: "sent" },
    });

    // Webhook B (read) executes first and updates DB to 'read'
    const resB = await handleWhatsAppDeliveryStatusUpdate(sim.client, msgId, "read");
    assert(resB.statusUpdated === true && resB.nextStatus === "read", "Simulated Webhook B update to read failed");
    assert(sim.records.rec1.reminder_delivery_status === "read", "DB state must now be 'read'");

    // Webhook A (delivered) was initiated when DB was 'sent', but reaches update step AFTER Webhook B
    // In un-guarded code, Webhook A would overwrite DB to 'delivered'.
    // In our guarded code, the DB update filter rejects the update because DB is now 'read'!
    const resA = await handleWhatsAppDeliveryStatusUpdate(sim.client, msgId, "delivered");
    assert(resA.statusUpdated === false, "Simulated Webhook A must NOT update DB after Webhook B set status to 'read'");
    assert(sim.records.rec1.reminder_delivery_status === "read", "DB state must REMAIN 'read'");
    console.log("✓ Persistence Concurrency Test passed: Stale 'delivered' request blocked from overwriting 'read'");
  }

  console.log("=================================================");
  console.log(" ALL WHATSAPP DELIVERY ATOMICITY TESTS PASSED    ");
  console.log("=================================================");
}
