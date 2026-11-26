"""Scenario 2 local workflow: a single approved plan and durable operations."""
import pytest
from agents.uc2_journey import create_journey, approve_journey, execute_step, get_journey, revise_journey, JourneyError


def test_review_approval_retry_and_verified_completion(store):
    journey = create_journey(store, 'test-session')
    with pytest.raises(JourneyError):
        execute_step(store, journey['id'], 'send')
    approved = approve_journey(store, journey['id'], journey['version'])
    assert approved['state'] == 'READY_TO_SEND'
    sent = execute_step(store, journey['id'], 'send')
    assert sent['state'] == 'AWAITING_BUSINESS'
    assert execute_step(store, journey['id'], 'send')['state'] == 'AWAITING_BUSINESS'
    submitted = execute_step(store, journey['id'], 'submit')
    assert submitted['state'] == 'READY_FOR_REVIEW'
    result = execute_step(store, journey['id'], 'verify')
    assert result['state'] == 'CLOSED'
    assert result['verification']['net'] == 412000
    assert get_journey(store, journey['id'])['state'] == 'CLOSED'


def test_changed_draft_invalidates_approval(store):
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    changed = revise_journey(store, journey['id'], 'Revised draft')
    assert changed['state'] == 'AWAITING_APPROVAL'
    with pytest.raises(JourneyError):
        approve_journey(store, journey['id'], journey['version'])
    with pytest.raises(JourneyError):
        execute_step(store, journey['id'], 'send')


def test_failed_write_never_advances(store):
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    store.fail_next = True
    with pytest.raises(JourneyError):
        execute_step(store, journey['id'], 'send')
    assert get_journey(store, journey['id'])['state'] == 'READY_TO_SEND'


def test_fta_audit_branch_closes_without_business(store):
    from agents.uc2_journey import select_option
    journey = create_journey(store, 'test-session')
    selected = select_option(store, journey['id'], 'FTA_SPECIALIST', 'OPT-FTA-REC-2')
    assert selected['fta_branch'] == 'audit'
    assert selected['state'] == 'AWAITING_APPROVAL'
    approve_journey(store, selected['id'], selected['version'])
    closed = execute_step(store, selected['id'], 'send')
    assert closed['state'] == 'CLOSED'
    assert closed['verification']['result'] == 'referred_to_audit'


def test_business_weak_option_blocks_submit(store):
    from agents.uc2_journey import select_option
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    execute_step(store, journey['id'], 'send')
    blocked = select_option(store, journey['id'], 'BUSINESS', 'OPT-BUS-REC-2')
    assert blocked['business_branch'] == 'blocked_weak'
    with pytest.raises(JourneyError):
        execute_step(store, journey['id'], 'submit')


def test_extension_grant_returns_to_business(store):
    from agents.uc2_journey import select_option
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    execute_step(store, journey['id'], 'send')
    select_option(store, journey['id'], 'BUSINESS', 'OPT-BUS-REC-3')
    waiting = execute_step(store, journey['id'], 'submit')
    assert waiting['state'] == 'AWAITING_EXTENSION_DECISION'
    granted = execute_step(store, journey['id'], 'grant_extension')
    assert granted['state'] == 'AWAITING_BUSINESS'
    assert granted['draft']['extension']['status'] == 'GRANTED'




def test_extension_deny_closes(store):
    from agents.uc2_journey import select_option
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    execute_step(store, journey['id'], 'send')
    select_option(store, journey['id'], 'BUSINESS', 'OPT-BUS-REC-3')
    execute_step(store, journey['id'], 'submit')
    denied = execute_step(store, journey['id'], 'deny_extension')
    assert denied['state'] == 'CLOSED'
    assert denied['verification']['result'] == 'extension_denied'


def test_changing_fta_option_clears_approval(store):
    from agents.uc2_journey import select_option
    journey = create_journey(store, 'test-session')
    approve_journey(store, journey['id'], journey['version'])
    assert get_journey(store, journey['id'])['state'] == 'READY_TO_SEND'
    changed = select_option(store, journey['id'], 'FTA_SPECIALIST', 'OPT-FTA-REC-2')
    assert changed['state'] == 'AWAITING_APPROVAL'
    assert changed['fta_branch'] == 'audit'

@pytest.fixture
def store():
    from agents.uc2_journey import MemoryStore
    return MemoryStore()
