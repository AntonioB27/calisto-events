import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INVITATION_DOCUMENT_ID } from '@/lib/event-print/invitation-document';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn() }));
vi.mock('@/lib/supabase-auth-server', () => ({ getSupabaseAuthServerClient: () => ({
  auth: { getUser: mocks.getUser }, from: (table: string) => table === 'events' ? { select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) } : { upsert: mocks.upsert, update: mocks.update },
}) }));
import { POST } from './route';
const ctx = { params: Promise.resolve({ id: 'event-1' }) };
function request(fieldValues: unknown = { partner_a: 'Ana', partner_b: 'Luka' }, expectedFields: unknown = null) { return new Request('http://localhost/api/events/event-1/invitation-drafts', { method: 'POST', body: JSON.stringify({ fieldValues, expectedFields }) }); }
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'owner' } } });
  mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: 'owner', event_kind: 'wedding' }, error: null });
  const chain = { eq: mocks.eq, select: mocks.select };
  mocks.eq.mockReturnValue(chain); mocks.upsert.mockReturnValue(chain); mocks.update.mockReturnValue(chain);
  mocks.select.mockResolvedValue({ data: [{ field_values: {} }], error: null });
});
describe('invitation saving', () => {
  it('inserts a single canonical document without overwriting an existing draft', async () => {
    expect((await POST(request(), ctx)).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ event_id: 'event-1', template_id: INVITATION_DOCUMENT_ID, field_values: expect.objectContaining({ _invitation_version: '2', partner_a: 'Ana' }) }), { onConflict: 'event_id,template_id', ignoreDuplicates: true });
  });
  it('checks the previously loaded JSON in the same statement as the update', async () => {
    const old = { partner_a: 'Ana', partner_b: 'Luka' };
    expect((await POST(request({ ...old, partner_a: 'Anamarija' }, old), ctx)).status).toBe(200);
    expect(mocks.eq).toHaveBeenCalledWith('field_values', JSON.stringify(old));
    expect(mocks.eq).toHaveBeenCalledWith('event_id', 'event-1');
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it.each([null, { partner_a: 'old' }])('reports a stale draft instead of overwriting it', async expected => {
    mocks.select.mockResolvedValue({ data: [], error: null });
    expect((await POST(request(undefined, expected), ctx)).status).toBe(409);
  });
  it('rejects anonymous users', async () => { mocks.getUser.mockResolvedValue({ data: { user: null } }); expect((await POST(request(), ctx)).status).toBe(401); expect(mocks.upsert).not.toHaveBeenCalled(); });
  it('rejects other organizers', async () => { mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: 'other', event_kind: 'wedding' } }); expect((await POST(request(), ctx)).status).toBe(403); expect(mocks.upsert).not.toHaveBeenCalled(); });
  it('rejects non-wedding events', async () => { mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: 'owner', event_kind: 'generic' } }); expect((await POST(request(), ctx)).status).toBe(400); });
  it.each([null, [], {}, { partner_a: 'Ana', partner_b: 'x'.repeat(81) }, { partner_a: 'Ana', partner_b: 'Luka', show_quote: 'invalid' }])('rejects invalid fields %j', async fields => { expect((await POST(request(fields), ctx)).status).toBe(400); expect(mocks.upsert).not.toHaveBeenCalled(); });
  it('reports database failure', async () => { mocks.select.mockResolvedValue({ error: { message: 'failure' } }); const log = vi.spyOn(console, 'error').mockImplementation(() => {}); expect((await POST(request(), ctx)).status).toBe(500); log.mockRestore(); });
});
