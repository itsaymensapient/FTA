"""Persistent, explicitly approved local demonstration journey for Al Yasmeen."""
from __future__ import annotations
import copy
import json
import uuid
from contextlib import contextmanager
from typing import Any

import rules


class JourneyError(Exception):
    pass


def _draft() -> dict[str, Any]:
    from tools.uc2_return import get_return_reconciliation
    from tools.shared_case import draft_letter, prepare_vd, prepare_reply
    reconciliation = get_return_reconciliation(rules.YASMEEN_CASE)
    return {"case_id": rules.YASMEEN_CASE, "company_tin": rules.YASMEEN_TIN,
            "letter": draft_letter(rules.YASMEEN_CASE)["draft"],
            "disclosure": prepare_vd(rules.YASMEEN_CASE)["vd_draft"],
            "reply": prepare_reply(rules.YASMEEN_CASE)["reply_draft"],
            "expected": {"dubai": reconciliation["box_1b_gap_aed"], "net": reconciliation["net_gap_aed"]},
            "actions": ["send demo letter", "submit demo disclosure and reply", "verify and close demo case"]}


class MemoryStore:
    """In-memory store used exclusively in unit tests."""
    def __init__(self):
        self.rows = {}
        self.fail_next = False

    @contextmanager
    def transaction(self, journey_id=None):
        rows = copy.deepcopy(self.rows)
        yield rows
        if self.fail_next:
            self.fail_next = False
            raise JourneyError("Database action failed. Retry from the same step.")
        self.rows = rows


class PostgresStore:
    """One row lock and one transaction serialize concurrent requests."""
    @contextmanager
    def transaction(self, journey_id=None):
        from ali import db
        try:
            with db.connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("CREATE SCHEMA IF NOT EXISTS app")
                    cur.execute("""CREATE TABLE IF NOT EXISTS app.uc2_journey (
                      journey_id text PRIMARY KEY, session_id text NOT NULL,
                      data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())""")
                    rows = {}
                    if journey_id:
                        cur.execute('SELECT data FROM app.uc2_journey WHERE journey_id=%s FOR UPDATE', (journey_id,))
                        row = cur.fetchone()
                        if row: rows[journey_id] = row[0]
                    original = copy.deepcopy(rows)
                    yield rows
                    for key, data in rows.items():
                        if original.get(key) == data:
                            continue
                        cur.execute("""INSERT INTO app.uc2_journey (journey_id,session_id,data)
                          VALUES (%s,%s,%s::jsonb) ON CONFLICT (journey_id)
                          DO UPDATE SET data=EXCLUDED.data,updated_at=now()""",
                          (key,data['session_id'],json.dumps(data,default=str)))
                    conn.commit()
                    for key, data in rows.items():
                        if original.get(key) == data:
                            continue
                        cur.execute('SELECT data FROM app.uc2_journey WHERE journey_id=%s', (key,))
                        saved = cur.fetchone()
                        if not saved or saved[0] != json.loads(json.dumps(data, default=str)):
                            raise JourneyError('Saved state could not be verified. Retry using the same journey.')
        except JourneyError:
            raise
        except Exception as exc:
            raise JourneyError('Database action failed. Retry from the same step.') from exc


def _row(rows, journey_id):
    if journey_id not in rows:
        raise JourneyError('Journey not found. Start a new demo journey.')
    return rows[journey_id]


def create_journey(store, session_id):
    if not isinstance(session_id,str) or not session_id.strip() or len(session_id)>128:
        raise JourneyError('A demo session ID is required.')
    from agents.journey_options import option_meta
    fta = option_meta('RETURN_VS_EINVOICES', 'FTA_SPECIALIST', 'OPT-FTA-REC-1')
    journey = {'id':str(uuid.uuid4()), 'session_id':session_id, 'version':1,
               'state':'AWAITING_APPROVAL','draft':_draft(),'approved_version':None,
               'fta_option_id': fta['option_id'], 'fta_branch': fta['branch'],
               'business_option_id': None, 'business_branch': None,
               'operations':{},'events':[{'type':'preview_created'}]}
    with store.transaction() as rows: rows[journey['id']] = copy.deepcopy(journey)
    return journey


def get_journey(store, journey_id):
    with store.transaction(journey_id) as rows:
        result = copy.deepcopy(_row(rows,journey_id))
    return result


def select_option(store, journey_id, side: str, option_id: str):
    from agents.journey_options import option_meta
    if side not in {'FTA_SPECIALIST', 'BUSINESS'}:
        raise JourneyError('Unknown decision side.')
    try:
        meta = option_meta('RETURN_VS_EINVOICES', side, option_id)
    except KeyError as err:
        raise JourneyError(str(err)) from err
    with store.transaction(journey_id) as rows:
        row = _row(rows, journey_id)
        if side == 'FTA_SPECIALIST':
            if row['state'] not in ('AWAITING_APPROVAL', 'READY_TO_SEND'):
                raise JourneyError('FTA options can only be changed before the letter is sent.')
            if row.get('fta_option_id') == option_id and row.get('fta_branch') == meta['branch']:
                return copy.deepcopy(row)
            row['fta_option_id'] = option_id
            row['fta_branch'] = meta['branch']
            row['version'] += 1
            row['approved_version'] = None
            row['state'] = 'AWAITING_APPROVAL'
            if meta['branch'] == 'audit':
                row['draft']['actions'] = ['refer case to audit and close demo path']
            else:
                row['draft']['actions'] = [
                    'send demo letter',
                    'submit demo disclosure and reply',
                    'verify and close demo case',
                ]
        else:
            if row['state'] not in ('AWAITING_BUSINESS', 'AWAITING_EXTENSION_DECISION'):
                raise JourneyError('Business options are available after the FTA letter is sent.')
            if meta['branch'] == 'blocked_weak':
                row['business_option_id'] = option_id
                row['business_branch'] = meta['branch']
                row['events'].append({'type': 'business_option_blocked', 'option_id': option_id})
                result = copy.deepcopy(row)
                result['blocked_message'] = meta.get('weak_option_reply') or rules.weak_option_vd_only_explanation()
                return result
            row['business_option_id'] = option_id
            row['business_branch'] = meta['branch']
            if meta['branch'] == 'extension':
                from tools.shared_case import request_extension
                row['draft']['extension'] = request_extension(rules.YASMEEN_CASE)
        row['events'].append({'type': 'option_selected', 'side': side, 'option_id': option_id, 'branch': meta['branch']})
        result = copy.deepcopy(row)
    return result


def approve_journey(store, journey_id, version):
    with store.transaction(journey_id) as rows:
        row = _row(rows,journey_id)
        if row['state'] != 'AWAITING_APPROVAL' or version != row['version']:
            raise JourneyError('The preview has changed or is not awaiting approval. Review it again.')
        if row.get('fta_branch') not in {'recommended', 'audit'}:
            raise JourneyError('Choose a supported FTA option before approving.')
        row['approved_version'] = version
        row['state'] = 'READY_TO_SEND'
        row['events'].append({'type':'journey_approved','version':version, 'fta_option_id': row.get('fta_option_id')})
        result=copy.deepcopy(row)
    return result


def revise_journey(store, journey_id, text):
    if not isinstance(text,str) or not text.strip() or len(text)>5000:
        raise JourneyError('Enter a draft letter between 1 and 5000 characters.')
    with store.transaction(journey_id) as rows:
        row = _row(rows,journey_id)
        if row['state'] not in ('AWAITING_APPROVAL','READY_TO_SEND'):
            raise JourneyError('This draft cannot be changed after the demo letter is sent.')
        row['draft']['letter']['body_text'] = text.strip()
        row['version'] += 1
        row['approved_version'] = None
        row['state'] = 'AWAITING_APPROVAL'
        row['events'].append({'type':'draft_revised','version':row['version']})
        result=copy.deepcopy(row)
    return result


def execute_step(store, journey_id, action):
    if action == 'grant_extension':
        return _extension_decision(store, journey_id, grant=True)
    if action == 'deny_extension':
        return _extension_decision(store, journey_id, grant=False)
    transitions={'send':('READY_TO_SEND', None),
                 'submit':('AWAITING_BUSINESS', None),
                 'verify':('READY_FOR_REVIEW','CLOSED')}
    if action not in transitions: raise JourneyError('Unknown journey action.')
    with store.transaction(journey_id) as rows:
        row=_row(rows,journey_id)
        if action in row['operations']:
            return copy.deepcopy(row)
        if action == 'send' and row['approved_version'] != row['version']:
            raise JourneyError('Review and approve the current journey first.')
        if action == 'submit' and row.get('business_branch') == 'blocked_weak':
            raise JourneyError(row.get('blocked_message') or rules.weak_option_vd_only_explanation())
        if action == 'submit' and not row.get('business_branch'):
            # Default recommended for API/tests that skip explicit select
            from agents.journey_options import option_meta
            meta = option_meta('RETURN_VS_EINVOICES', 'BUSINESS', 'OPT-BUS-REC-1')
            row['business_option_id'] = meta['option_id']
            row['business_branch'] = meta['branch']
        expected,_ = transitions[action]
        if row['state'] != expected:
            raise JourneyError('The action is not available at the current step.')
        if action == 'send':
            if row.get('fta_branch') == 'audit':
                next_state = 'CLOSED'
                row['verification'] = {'result': 'referred_to_audit', 'net': None}
                payload = {'outcome': 'REFERRED_TO_AUDIT', 'option_id': row.get('fta_option_id')}
            else:
                next_state = 'AWAITING_BUSINESS'
                payload = {'letter': row['draft']['letter']}
        elif action == 'submit':
            if row.get('business_branch') == 'extension':
                next_state = 'AWAITING_EXTENSION_DECISION'
                payload = {'extension': row['draft'].get('extension') or {}}
            else:
                next_state = 'READY_FOR_REVIEW'
                payload = {'disclosure': row['draft']['disclosure'], 'reply': row['draft']['reply']}
        else:
            next_state = 'CLOSED'
            submitted = row['operations']['submit']['payload']
            boxes={str(x['box_code']):x['change_vat_aed'] for x in submitted['disclosure']['boxes']}
            dubai=boxes.get('1b'); abu_dhabi=boxes.get('1a'); net=boxes.get('14')
            from tools.uc2_return import get_return_reconciliation
            evidence = get_return_reconciliation(rules.YASMEEN_CASE)
            if (dubai != evidence['box_1b_gap_aed'] or net != evidence['net_gap_aed']
                    or abu_dhabi is None or dubai+abu_dhabi != net):
                raise JourneyError('The saved disclosure does not reconcile. Review the draft.')
            row['verification']={'dubai':dubai,'abu_dhabi':abu_dhabi,'net':net,'result':'matched'}
            payload = row['verification']
        row['operations'][action]={'id':str(uuid.uuid4()),'status':'RECORDED_IN_DEMO',
                                   'version':row['version'],'payload':copy.deepcopy(payload)}
        row['state']=next_state
        row['events'].append({'type':action,'operation_id':row['operations'][action]['id']})
        result=copy.deepcopy(row)
    return result


def _extension_decision(store, journey_id, *, grant: bool):
    with store.transaction(journey_id) as rows:
        row = _row(rows, journey_id)
        op = 'grant_extension' if grant else 'deny_extension'
        if op in row['operations']:
            return copy.deepcopy(row)
        if row['state'] != 'AWAITING_EXTENSION_DECISION':
            raise JourneyError('No extension request is waiting for a decision.')
        if grant:
            from datetime import date, timedelta
            ext = row['draft'].setdefault('extension', {})
            req = ext.setdefault('request', {})
            req['granted_deadline'] = (date.today() + timedelta(days=rules.CLARIFICATION_BUSINESS_DAYS)).isoformat()
            ext['status'] = 'GRANTED'
            row['operations'][op] = {'id': str(uuid.uuid4()), 'status': 'RECORDED_IN_DEMO', 'payload': copy.deepcopy(ext)}
            row['business_option_id'] = 'OPT-BUS-REC-1'
            row['business_branch'] = 'recommended'
            row['state'] = 'AWAITING_BUSINESS'
            row['events'].append({'type': 'extension_granted'})
        else:
            row['operations'][op] = {'id': str(uuid.uuid4()), 'status': 'RECORDED_IN_DEMO', 'payload': {'granted': False}}
            row['verification'] = {'result': 'extension_denied', 'net': None}
            row['state'] = 'CLOSED'
            row['events'].append({'type': 'extension_denied'})
        return copy.deepcopy(row)
