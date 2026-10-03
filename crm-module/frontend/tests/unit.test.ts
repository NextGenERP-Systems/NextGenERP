import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError, normalize, opportunityPayload, rows, snapshotAmount, type Opportunity } from '../src/lib/api';
import { formPayload, initialValues, panels, resources } from '../src/lib/resources';

test('normalizes SQL names and retains page boundaries without inventing totals', () => {
  assert.deepEqual(normalize([{ contract_number: 'C1', total_amount: 12.5, warranty_starts_on: '2026-01-01' }]), [{ contractNumber: 'C1', totalAmount: 12.5, warrantyStartsOn: '2026-01-01' }]);
  assert.deepEqual(rows({ content: [{ id: 'a' }], totalElements: 20 }), [{ id: 'a' }]);
  assert.deepEqual(rows(undefined), []);
  assert.equal(snapshotAmount('100.00', 'USD'), 'USD 100.00');
  assert.equal(snapshotAmount('100.00', 'INR'), 'INR 100.00');
  assert.deepEqual(normalize({ type: 'jsonb', value: '{"USD":100,"INR":200}' }), { USD: 100, INR: 200 });
});
test('opportunity interaction queries use the backend target enum', () => {
  const resource = resources.find(r => r.route === 'opportunities')!;
  const interactions = panels(resource, 'id').filter(panel => panel.path.includes('targetType='));
  assert.equal(interactions.length, 3);
  for (const panel of interactions) assert.match(panel.path, /targetType=OPPORTUNITY&targetId=id/);
});
test('stage PUT preserves all writable ownership and reference fields with a precondition', () => {
  const row: Opportunity = { id: '1', opportunityName: 'Pump', status: 'OPEN', updatedAt: '2026-01-01T10:00:00.123456', prospect: { id: 'p' }, customerId: 'c', amount: 123.45, probability: 40, salesStage: { id: 's' }, opportunityType: { id: 't' }, lostReason: { id: 'r' }, assignedTo: 'u', expectedCloseDate: '2026-10-20' };
  assert.deepEqual(opportunityPayload(row), { opportunityName: 'Pump', prospectId: 'p', customerId: 'c', amount: 123.45, probability: 40, salesStageId: 's', opportunityTypeId: 't', lostReasonId: 'r', assignedTo: 'u', expectedCloseDate: '2026-10-20', status: 'OPEN', expectedUpdatedAt: row.updatedAt });
  assert.equal('attributionTouchpointId' in opportunityPayload(row), false);
});
test('forms retain relations and zero values and distinguish dates from instants', () => {
  const fields = resources.find(r => r.route === 'opportunities')!.fields;
  const values = initialValues(fields, { prospect: { id: 'p' }, probability: 0, amount: 0, expectedCloseDate: '2026-01-02' });
  assert.equal(values.prospectId, 'p');
  assert.equal(values.probability, 0);
  assert.equal(formPayload(fields, values).expectedCloseDate, '2026-01-02');
  assert.equal(formPayload([{ key: 'startsAt', type: 'datetime-local' }], { startsAt: '2026-01-02T09:00' }).startsAt, new Date('2026-01-02T09:00').toISOString());
  assert.throws(() => formPayload([{ key: 'variables', type: 'json' }], { variables: '[]' }), /JSON object/);
});
test('409 errors expose stale edits and mutations never retry silently', async () => {
  const original = global.fetch; let calls = 0;
  global.fetch = async () => { calls++; return new Response(JSON.stringify({ message: 'Reload and review', fields: { amount: 'Invalid' } }), { status: 409 }); };
  try {
    await assert.rejects(api('/opportunities/id', 'PUT', {}), (error: unknown) => error instanceof ApiError && error.status === 409 && error.message === 'Reload and review');
    assert.equal(calls, 1);
    await assert.rejects(api('//sales'), /Invalid CRM API path/);
  } finally { global.fetch = original; }
});
