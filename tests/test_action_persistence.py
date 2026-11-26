from tools.shared_case import send_letter, submit


def test_send_does_not_claim_success_when_database_unavailable(monkeypatch):
    from ali import db
    monkeypatch.setattr(db, 'has_postgres', lambda: False)
    result = send_letter('CDP-VAT-2026-1187', confirm=True)
    assert result['ok'] is False
    assert result['status'] != 'SENT'


def test_submit_does_not_claim_success_when_database_unavailable(monkeypatch):
    from ali import db
    monkeypatch.setattr(db, 'has_postgres', lambda: False)
    result = submit('CDP-VAT-2026-1187', confirm=True)
    assert result['ok'] is False
    assert result['status'] != 'SUBMITTED'
