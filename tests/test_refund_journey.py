"""Al Waha demo must record and verify the shared two-role journey."""
import pytest
from agents.uc2_journey import MemoryStore, JourneyError


def test_refund_journey_human_approval_and_shared_handoff():
    from agents.refund_journey import create_refund, approve_refund, refund_step, get_refund
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    with pytest.raises(JourneyError):
        refund_step(store, journey['id'], 'send')
    approve_refund(store, journey['id'], journey['version'])
    sent = refund_step(store, journey['id'], 'send')
    assert sent['state'] == 'AWAITING_BUSINESS'
    assert refund_step(store, journey['id'], 'send')['operations']['send']['id'] == sent['operations']['send']['id']
    assert refund_step(store, journey['id'], 'submit')['state'] == 'READY_FOR_REVIEW'
    closed = refund_step(store, journey['id'], 'verify')
    assert closed['state'] == 'CLOSED'
    assert closed['verification']['approved'] == 203600
    assert closed['verification']['rejected'] == 34200
    assert closed['verification']['on_hold'] == 46800
    assert get_refund(store, journey['id'])['state'] == 'CLOSED'


def test_refund_cannot_send_changed_unapproved_draft():
    from agents.refund_journey import create_refund, approve_refund, revise_refund, refund_step
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    approve_refund(store, journey['id'], journey['version'])
    revise_refund(store, journey['id'], 'Edited draft')
    with pytest.raises(JourneyError):
        refund_step(store, journey['id'], 'send')


def test_refund_does_not_close_when_disclosure_correction_is_missing():
    from agents.refund_journey import create_refund, approve_refund, refund_step, get_refund
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    approve_refund(store, journey['id'], journey['version'])
    refund_step(store, journey['id'], 'send')
    refund_step(store, journey['id'], 'submit')
    store.rows[journey['id']]['operations']['submit']['payload']['disclosure']['boxes'] = []
    with pytest.raises(JourneyError):
        refund_step(store, journey['id'], 'verify')
    assert get_refund(store, journey['id'])['state'] == 'READY_FOR_REVIEW'


def test_refund_does_not_close_when_box_9_correction_is_wrong():
    from agents.refund_journey import create_refund, approve_refund, refund_step
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    approve_refund(store, journey['id'], journey['version'])
    refund_step(store, journey['id'], 'send')
    refund_step(store, journey['id'], 'submit')
    boxes = store.rows[journey['id']]['operations']['submit']['payload']['disclosure']['boxes']
    next(b for b in boxes if b['box_code'] == '9')['change_vat_aed'] = 0
    with pytest.raises(JourneyError):
        refund_step(store, journey['id'], 'verify')


def test_refund_audit_branch_closes_on_send():
    from agents.refund_journey import create_refund, approve_refund, refund_step, select_refund_option
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    selected = select_refund_option(store, journey['id'], 'FTA_SPECIALIST', 'OPT-FTA-REF-3')
    approve_refund(store, selected['id'], selected['version'])
    closed = refund_step(store, selected['id'], 'send')
    assert closed['state'] == 'CLOSED'
    assert closed['verification']['result'] == 'referred_to_audit'


def test_refund_hold_all_then_verify():
    from agents.refund_journey import create_refund, approve_refund, refund_step, select_refund_option
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    selected = select_refund_option(store, journey['id'], 'FTA_SPECIALIST', 'OPT-FTA-REF-2')
    assert selected['fta_branch'] == 'hold_all'
    assert selected['draft']['hold_all'] is True
    approve_refund(store, selected['id'], selected['version'])
    refund_step(store, selected['id'], 'send')
    refund_step(store, selected['id'], 'submit')
    closed = refund_step(store, selected['id'], 'verify')
    assert closed['state'] == 'CLOSED'
    assert closed['verification']['approved'] == 203600


def test_refund_card_slip_option_blocks_submit():
    from agents.refund_journey import create_refund, approve_refund, refund_step, select_refund_option
    store = MemoryStore()
    journey = create_refund(store, 'refund-test')
    approve_refund(store, journey['id'], journey['version'])
    refund_step(store, journey['id'], 'send')
    select_refund_option(store, journey['id'], 'BUSINESS', 'OPT-BUS-REF-2')
    with pytest.raises(JourneyError):
        refund_step(store, journey['id'], 'submit')


def test_refund_extension_grant_and_deny():
    from agents.refund_journey import create_refund, approve_refund, refund_step, select_refund_option
    store = MemoryStore()
    journey = create_refund(store, 'refund-ext')
    approve_refund(store, journey['id'], journey['version'])
    refund_step(store, journey['id'], 'send')
    select_refund_option(store, journey['id'], 'BUSINESS', 'OPT-BUS-REF-3')
    waiting = refund_step(store, journey['id'], 'submit')
    assert waiting['state'] == 'AWAITING_EXTENSION_DECISION'
    granted = refund_step(store, journey['id'], 'grant_extension')
    assert granted['state'] == 'AWAITING_BUSINESS'
    # deny path on a fresh journey
    store2 = MemoryStore()
    j2 = create_refund(store2, 'refund-deny')
    approve_refund(store2, j2['id'], j2['version'])
    refund_step(store2, j2['id'], 'send')
    select_refund_option(store2, j2['id'], 'BUSINESS', 'OPT-BUS-REF-3')
    refund_step(store2, j2['id'], 'submit')
    denied = refund_step(store2, j2['id'], 'deny_extension')
    assert denied['state'] == 'CLOSED'
    assert denied['verification']['result'] == 'extension_denied'
