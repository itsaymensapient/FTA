"""Regression checks for evidence-backed workbook AgentTools."""
from ali.tables import Tables
import rules


def test_supplier_with_filed_returns_is_not_reported_as_non_filer(monkeypatch):
    from tools import uc3_refund
    data = Tables({'taxpayer': [{'tin': '123', 'legal_name': 'Supplier'}],
                   'return_obligation': [{'tin': '123', 'status': 'FILED', 'return_id': 'R1'}]}, 'test')
    monkeypatch.setattr(uc3_refund, 'tables', lambda: data)
    result = uc3_refund.get_supplier_status('123')
    assert result['filing'] is True
    assert result['unfiled_obligation_count'] == 0
    assert result['non_filer_case_id'] is None


def test_missing_vd_box_cannot_be_reported_as_matching(monkeypatch):
    from tools import uc2_return
    data = Tables({'voluntary_disclosure': [{'case_id': 'C', 'vd_id': 'VD'}],
                   'vd_box': []}, 'test')
    monkeypatch.setattr(uc2_return, 'tables', lambda: data)
    monkeypatch.setattr(uc2_return, 'get_return_reconciliation', lambda case_id: {
        'findings': [{'box_code': '1b', 'einvoice_vat_aed': 100}]})
    result = uc2_return.check_answer_return('C')
    assert result['matches_einvoices'] is False
    assert result['recommendation'] != 'CLOSE'
    assert result['missing_boxes'] == ['1b']


def test_missing_finding_ledger_does_not_fall_back_to_unrelated_records(monkeypatch):
    from tools import uc2_return
    data = Tables({'taxpayer': [{'tin': rules.YASMEEN_TIN, 'legal_name': 'Business'}],
                   'finding_invoice': [{'finding_id':'F-1187-01', 'invoice_uuid':'EXPECTED'}],
                   'taxpayer_record':[{'tin':rules.YASMEEN_TIN, 'invoice_uuid':'UNRELATED',
                                       'booked_box':'1b','vat_amount_aed': 999}]}, 'test')
    monkeypatch.setattr(uc2_return, 'tables', lambda: data)
    result = uc2_return.match_ledger(rules.YASMEEN_TIN, rules.YASMEEN_CASE)
    assert result['record_count'] == 0
    assert result['booked_box_1b_vat_aed'] == 0


def test_extension_request_is_a_draft_for_known_case():
    from tools import request_extension
    result = request_extension(rules.YASMEEN_CASE)
    assert result['case_id'] == rules.YASMEEN_CASE
    assert result['status'] == 'DRAFT'
    assert result['requires_human_submit'] is True
    assert result['how']['tool'] == 'request_extension'


def test_company_overview_includes_returns_and_registration():
    from tools import get_company_overview
    result = get_company_overview(rules.YASMEEN_TIN)
    assert result['registration']['vat_status'] == 'ACTIVE'
    assert any(item['return_id'] for item in result['returns'])


def test_ledger_match_lists_each_requested_invoice_including_missing(monkeypatch):
    from tools import uc2_return
    data = Tables({'taxpayer': [{'tin': rules.YASMEEN_TIN, 'legal_name': 'Business'}],
                   'finding_invoice': [{'finding_id':'F-1187-01', 'invoice_uuid':'A'},
                                       {'finding_id':'F-1187-01', 'invoice_uuid':'B'}],
                   'e_invoice': [{'invoice_uuid':'A','invoice_number':'A1'}, {'invoice_uuid':'B','invoice_number':'B1'}],
                   'taxpayer_record':[{'tin':rules.YASMEEN_TIN,'invoice_uuid':'A','booked_box':'1b',
                                       'booked_period_code':'2026-10','vat_amount_aed': 10}]}, 'test')
    monkeypatch.setattr(uc2_return, 'tables', lambda: data)
    result = uc2_return.match_ledger(rules.YASMEEN_TIN, rules.YASMEEN_CASE)
    entries = {entry['invoice_uuid']: entry for entry in result['invoices']}
    assert entries['A']['in_ledger'] is True
    assert entries['A']['records'][0]['booked_period_code'] == '2026-10'
    assert entries['B']['in_ledger'] is False


def test_business_query_is_limited_to_selected_company():
    from ali.agents.ask_agent import answer_question
    denied = answer_question('Show Al Waha refund', persist=False, demo_company='yasmeen')
    assert denied['tool'] is None
    assert 'own company' in denied['answer'].lower()
    allowed = answer_question('What is my VAT gap?', persist=False, demo_company='yasmeen')
    assert allowed['tool'] in {'yasmeen_box_gaps', 'yasmeen_gap_invoices', 'compare_return_vs_einvoices'}
    assert 'Al Waha' not in str(allowed['data'])


def test_business_query_rejects_unknown_company_scope():
    from ali.agents.ask_agent import answer_question
    import pytest
    with pytest.raises(ValueError):
        answer_question('Show my case', persist=False, demo_company='unknown')
