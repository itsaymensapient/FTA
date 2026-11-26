"""Versioned local Al Waha refund demonstration journey."""
from __future__ import annotations
import copy
import uuid
import rules
from agents.uc2_journey import JourneyError, _row


def _draft(*, hold_all: bool = False):
    from tools._data import tables
    from tools import draft_letter, prepare_reply, prepare_vd, get_refund_breakdown
    data = tables()
    docs = [dict(d) for d in data.all('case_document') if d.get('case_id') == rules.WAHA_CASE]
    letter_type = 'REQUEST' if hold_all else 'PARTIAL_APPROVAL_AND_REQUEST'
    letter = draft_letter(rules.WAHA_CASE, letter_type)['draft']
    if hold_all:
        letter = {
            **letter,
            'letter_type': 'HOLD_AND_REQUEST',
            'subject': 'VAT refund request · hold and request for documents',
            'body_text': (
                letter.get('body_text')
                or 'The full refund claim is held pending supporting documents and supplier filing.'
            ),
        }
    actions = (
        ['record hold letter', 'record demo disclosure and response', 'verify and record refund decision']
        if hold_all
        else ['record demo letter', 'record demo disclosure and response', 'verify and record refund decision']
    )
    return {
        'case_id': rules.WAHA_CASE,
        'letter': letter,
        'reply': prepare_reply(rules.WAHA_CASE)['reply_draft'],
        'disclosure': prepare_vd(rules.WAHA_CASE)['vd_draft'],
        'documents': docs,
        'refund': get_refund_breakdown(rules.WAHA_CASE),
        'actions': actions,
        'hold_all': hold_all,
    }


def create_refund(store, session_id):
    if not isinstance(session_id, str) or not session_id.strip() or len(session_id) > 128:
        raise JourneyError('A demo session ID is required.')
    from agents.journey_options import option_meta
    fta = option_meta('REFUND_REVIEW', 'FTA_SPECIALIST', 'OPT-FTA-REF-1')
    row = {
        'id': str(uuid.uuid4()),
        'kind': 'refund',
        'session_id': session_id,
        'version': 1,
        'state': 'AWAITING_APPROVAL',
        'approved_version': None,
        'draft': _draft(),
        'fta_option_id': fta['option_id'],
        'fta_branch': fta['branch'],
        'business_option_id': None,
        'business_branch': None,
        'operations': {},
        'events': [{'type': 'preview_created'}],
    }
    with store.transaction() as rows:
        rows[row['id']] = copy.deepcopy(row)
    return row


def _refund(rows, journey_id):
    row = _row(rows, journey_id)
    if row.get('kind') != 'refund':
        raise JourneyError('This is not a refund journey.')
    return row


def get_refund(store, journey_id):
    with store.transaction(journey_id) as rows:
        result = copy.deepcopy(_refund(rows, journey_id))
    return result


def select_refund_option(store, journey_id, side: str, option_id: str):
    from agents.journey_options import option_meta
    if side not in {'FTA_SPECIALIST', 'BUSINESS'}:
        raise JourneyError('Unknown decision side.')
    try:
        meta = option_meta('REFUND_REVIEW', side, option_id)
    except KeyError as err:
        raise JourneyError(str(err)) from err
    with store.transaction(journey_id) as rows:
        row = _refund(rows, journey_id)
        if side == 'FTA_SPECIALIST':
            if row['state'] not in ('AWAITING_APPROVAL', 'READY_TO_SEND'):
                raise JourneyError('FTA options can only be changed before the letter is sent.')
            if row.get('fta_option_id') == option_id and row.get('fta_branch') == meta['branch']:
                return copy.deepcopy(row)
            row['fta_option_id'] = option_id
            row['fta_branch'] = meta['branch']
            row['draft'] = _draft(hold_all=(meta['branch'] == 'hold_all'))
            if meta['branch'] == 'audit':
                row['draft']['actions'] = ['refer refund case to audit and close demo path']
            row['version'] += 1
            row['approved_version'] = None
            row['state'] = 'AWAITING_APPROVAL'
        else:
            if row['state'] not in ('AWAITING_BUSINESS', 'AWAITING_EXTENSION_DECISION'):
                raise JourneyError('Business options are available after the FTA letter is sent.')
            if meta['branch'] == 'blocked_weak':
                row['business_option_id'] = option_id
                row['business_branch'] = meta['branch']
                row['events'].append({'type': 'business_option_blocked', 'option_id': option_id})
                result = copy.deepcopy(row)
                result['blocked_message'] = meta.get('weak_option_reply') or rules.weak_option_card_slips()
                return result
            row['business_option_id'] = option_id
            row['business_branch'] = meta['branch']
            if meta['branch'] == 'extension':
                from tools.shared_case import request_extension
                row['draft']['extension'] = request_extension(rules.WAHA_CASE)
        row['events'].append({'type': 'option_selected', 'side': side, 'option_id': option_id, 'branch': meta['branch']})
        return copy.deepcopy(row)


def approve_refund(store, journey_id, version):
    with store.transaction(journey_id) as rows:
        row = _refund(rows, journey_id)
        if row['state'] != 'AWAITING_APPROVAL' or version != row['version']:
            raise JourneyError('The preview has changed. Review it again.')
        if row.get('fta_branch') not in {'recommended', 'hold_all', 'audit'}:
            raise JourneyError('Choose a supported FTA option before approving.')
        row['approved_version'] = version
        row['state'] = 'READY_TO_SEND'
        row['events'].append({'type': 'journey_approved', 'version': version})
        result = copy.deepcopy(row)
    return result


def revise_refund(store, journey_id, text):
    if not isinstance(text, str) or not text.strip() or len(text) > 5000:
        raise JourneyError('Enter a draft letter between 1 and 5000 characters.')
    with store.transaction(journey_id) as rows:
        row = _refund(rows, journey_id)
        if row['state'] not in ('AWAITING_APPROVAL', 'READY_TO_SEND'):
            raise JourneyError('The letter cannot be changed after sending.')
        row['draft']['letter']['body_text'] = text.strip()
        row['version'] += 1
        row['approved_version'] = None
        row['state'] = 'AWAITING_APPROVAL'
        row['events'].append({'type': 'draft_revised', 'version': row['version']})
        result = copy.deepcopy(row)
    return result


def refund_step(store, journey_id, action):
    if action == 'grant_extension':
        return _extension_decision(store, journey_id, grant=True)
    if action == 'deny_extension':
        return _extension_decision(store, journey_id, grant=False)
    if action not in {'send', 'submit', 'verify'}:
        raise JourneyError('Unknown journey action.')
    with store.transaction(journey_id) as rows:
        row = _refund(rows, journey_id)
        if action in row['operations']:
            return copy.deepcopy(row)
        if action == 'send':
            if row['approved_version'] != row['version'] or row['state'] != 'READY_TO_SEND':
                raise JourneyError('Review and approve the current journey at the correct step.')
            if row.get('fta_branch') == 'audit':
                row['verification'] = {
                    'approved': 0,
                    'rejected': 0,
                    'on_hold': row['draft']['refund']['claimed_aed'],
                    'result': 'referred_to_audit',
                }
                payload = {'outcome': 'REFERRED_TO_AUDIT', 'option_id': row.get('fta_option_id')}
                next_state = 'CLOSED'
            else:
                payload = {'letter': row['draft']['letter']}
                next_state = 'AWAITING_BUSINESS'
        elif action == 'submit':
            if row['state'] != 'AWAITING_BUSINESS':
                raise JourneyError('Review and approve the current journey at the correct step.')
            if row.get('business_branch') == 'blocked_weak':
                raise JourneyError(row.get('blocked_message') or rules.weak_option_card_slips())
            if not row.get('business_branch'):
                from agents.journey_options import option_meta
                meta = option_meta('REFUND_REVIEW', 'BUSINESS', 'OPT-BUS-REF-1')
                row['business_option_id'] = meta['option_id']
                row['business_branch'] = meta['branch']
            if row.get('business_branch') == 'extension':
                payload = {'extension': row['draft'].get('extension') or {}}
                next_state = 'AWAITING_EXTENSION_DECISION'
            else:
                payload = {
                    'reply': row['draft']['reply'],
                    'disclosure': row['draft']['disclosure'],
                    'documents': row['draft']['documents'],
                }
                next_state = 'READY_FOR_REVIEW'
        else:
            if row['state'] != 'READY_FOR_REVIEW':
                raise JourneyError('Review and approve the current journey at the correct step.')
            payload = row['operations']['submit']['payload']
            paper = [d for d in payload['documents'] if d.get('document_type') == 'PAPER_TAX_INVOICE']
            bank = [d for d in payload['documents'] if d.get('document_type') == 'BANK_PAYMENT_CONFIRMATION']
            from tools import get_refund_breakdown
            evidence = get_refund_breakdown(rules.WAHA_CASE)
            paper_total = sum(float(d.get('vat_amount_aed') or 0) for d in paper)
            boxes = payload['disclosure']['boxes']
            if not paper or not bank or not boxes:
                raise JourneyError('The saved response is missing required evidence. Review the submission.')
            rejected = evidence['not_recoverable_card_slips_aed']
            box9 = next((b for b in boxes if str(b.get('box_code')) == '9'), None)
            if not box9 or abs(float(box9.get('change_vat_aed') or 0) + rejected) > 0.01:
                raise JourneyError('The disclosure does not match the unrecoverable input VAT.')
            held = evidence['bright_line_on_hold_aed']
            if row.get('fta_branch') == 'hold_all':
                # Whole claim stayed on hold until docs; after docs, same split as recommended path.
                approved = evidence['supported_by_einvoices_aed'] + paper_total
            else:
                approved = evidence['supported_by_einvoices_aed'] + paper_total
            if abs(approved + rejected + held - evidence['claimed_aed']) > 0.01:
                raise JourneyError('The refund amounts do not reconcile. Review the submission.')
            row['verification'] = {
                'approved': approved,
                'rejected': rejected,
                'on_hold': held,
                'result': 'matched',
            }
            payload = row['verification']
            next_state = 'CLOSED'
        row['operations'][action] = {
            'id': str(uuid.uuid4()),
            'status': 'RECORDED_IN_DEMO',
            'version': row['version'],
            'payload': copy.deepcopy(payload),
        }
        row['state'] = next_state
        row['events'].append({'type': action, 'operation_id': row['operations'][action]['id']})
        result = copy.deepcopy(row)
    return result


def _extension_decision(store, journey_id, *, grant: bool):
    from datetime import date, timedelta
    with store.transaction(journey_id) as rows:
        row = _refund(rows, journey_id)
        op = 'grant_extension' if grant else 'deny_extension'
        if op in row['operations']:
            return copy.deepcopy(row)
        if row['state'] != 'AWAITING_EXTENSION_DECISION':
            raise JourneyError('No extension request is waiting for a decision.')
        if grant:
            ext = row['draft'].setdefault('extension', {})
            req = ext.setdefault('request', {})
            req['granted_deadline'] = (date.today() + timedelta(days=rules.REFUND_DECISION_BUSINESS_DAYS)).isoformat()
            ext['status'] = 'GRANTED'
            row['operations'][op] = {'id': str(uuid.uuid4()), 'status': 'RECORDED_IN_DEMO', 'payload': copy.deepcopy(ext)}
            row['business_option_id'] = 'OPT-BUS-REF-1'
            row['business_branch'] = 'recommended'
            row['state'] = 'AWAITING_BUSINESS'
            row['events'].append({'type': 'extension_granted'})
        else:
            row['operations'][op] = {'id': str(uuid.uuid4()), 'status': 'RECORDED_IN_DEMO', 'payload': {'granted': False}}
            claimed = row['draft']['refund']['claimed_aed']
            row['verification'] = {'approved': 0, 'rejected': 0, 'on_hold': claimed, 'result': 'extension_denied'}
            row['state'] = 'CLOSED'
            row['events'].append({'type': 'extension_denied'})
        return copy.deepcopy(row)
