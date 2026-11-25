-- GITEX stand · v1.2 data model (from GITEX_CDP_Stand_Data_Model_v1.2.xlsx Fields sheet)

CREATE TABLE ref_vat201_box (
  box_code VARCHAR(8) PRIMARY KEY,
  label TEXT NOT NULL,
  emirate_code VARCHAR(8),
  columns TEXT NOT NULL
);

CREATE TABLE taxpayer (
  tin VARCHAR(10) PRIMARY KEY,
  trn VARCHAR(15),
  legal_name TEXT NOT NULL,
  legal_registration_no TEXT,
  licensing_authority TEXT,
  vat_status TEXT NOT NULL,
  vat_registration_date DATE,
  filing_frequency TEXT,
  einvoicing_status TEXT NOT NULL,
  business_size_segment TEXT,
  demo_role TEXT NOT NULL,
  einvoicing_provider TEXT
);

CREATE TABLE establishment (
  establishment_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  emirate_code VARCHAR(8) NOT NULL,
  vat201_box VARCHAR(8) NOT NULL REFERENCES ref_vat201_box (box_code),
  address TEXT NOT NULL,
  is_head_office CHAR(1) NOT NULL
);

CREATE TABLE e_invoice (
  invoice_uuid VARCHAR(36) PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  document_type_code VARCHAR(3) NOT NULL,
  issue_date DATE NOT NULL,
  vat_point_date DATE NOT NULL,
  delivery_date DATE,
  receipt_date DATE NOT NULL,
  seller_tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  seller_trn VARCHAR(15),
  seller_establishment_id TEXT NOT NULL REFERENCES establishment (establishment_id),
  seller_vat201_box VARCHAR(8) NOT NULL REFERENCES ref_vat201_box (box_code),
  buyer_tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  buyer_trn VARCHAR(15),
  currency_code VARCHAR(3) NOT NULL,
  net_amount_aed NUMERIC(18, 2) NOT NULL,
  vat_amount_aed NUMERIC(18, 2) NOT NULL,
  gross_amount_aed NUMERIC(18, 2) NOT NULL,
  c3_status TEXT NOT NULL,
  seller_period_code TEXT NOT NULL,
  buyer_period_code TEXT NOT NULL,
  preceding_invoice_number TEXT
);

CREATE TABLE e_invoice_line (
  invoice_uuid VARCHAR(36) NOT NULL REFERENCES e_invoice (invoice_uuid),
  line_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_description TEXT,
  quantity NUMERIC(18, 6) NOT NULL,
  unit_code TEXT NOT NULL,
  unit_price_aed NUMERIC(18, 6) NOT NULL,
  net_amount_aed NUMERIC(18, 2) NOT NULL,
  vat_category_code VARCHAR(2) NOT NULL,
  vat_rate NUMERIC(7, 4) NOT NULL,
  vat_amount_aed NUMERIC(18, 2) NOT NULL,
  PRIMARY KEY (invoice_uuid, line_id)
);

CREATE TABLE vat_return (
  return_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  trn VARCHAR(15) NOT NULL,
  period_code TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  filing_date DATE NOT NULL,
  box14_payable_vat_aed NUMERIC(18, 2) NOT NULL
);

CREATE TABLE vat_return_box (
  return_id TEXT NOT NULL REFERENCES vat_return (return_id),
  box_code VARCHAR(8) NOT NULL REFERENCES ref_vat201_box (box_code),
  amount_aed NUMERIC(18, 2),
  vat_aed NUMERIC(18, 2),
  adjustment_aed NUMERIC(18, 2),
  PRIMARY KEY (return_id, box_code)
);

CREATE TABLE fta_case (
  case_id TEXT PRIMARY KEY,
  case_type TEXT NOT NULL,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  period_code TEXT,
  risk_level TEXT NOT NULL,
  priority_reason TEXT NOT NULL,
  amount_at_stake_aed NUMERIC(18, 2) NOT NULL,
  status TEXT NOT NULL,
  opened_date DATE,
  deadline_date DATE,
  follow_up_date DATE,
  closed_date DATE,
  outcome TEXT,
  linked_case_id TEXT REFERENCES fta_case (case_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE return_obligation (
  obligation_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  period_code TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL,
  return_id TEXT REFERENCES vat_return (return_id)
);

CREATE TABLE voluntary_disclosure (
  vd_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  return_id TEXT NOT NULL REFERENCES vat_return (return_id),
  case_id TEXT REFERENCES fta_case (case_id),
  submission_date DATE NOT NULL,
  reason_text TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE vd_box (
  vd_id TEXT NOT NULL REFERENCES voluntary_disclosure (vd_id),
  box_code VARCHAR(8) NOT NULL REFERENCES ref_vat201_box (box_code),
  reported_amount_aed NUMERIC(18, 2),
  reported_vat_aed NUMERIC(18, 2),
  corrected_amount_aed NUMERIC(18, 2),
  corrected_vat_aed NUMERIC(18, 2),
  change_vat_aed NUMERIC(18, 2),
  PRIMARY KEY (vd_id, box_code)
);

CREATE TABLE refund_request (
  refund_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  return_id TEXT NOT NULL REFERENCES vat_return (return_id),
  amount_claimed_aed NUMERIC(18, 2) NOT NULL,
  submission_date DATE NOT NULL,
  decision_due_date DATE NOT NULL,
  status TEXT NOT NULL,
  approved_aed NUMERIC(18, 2) NOT NULL,
  rejected_aed NUMERIC(18, 2) NOT NULL,
  on_hold_aed NUMERIC(18, 2) NOT NULL,
  case_id TEXT REFERENCES fta_case (case_id)
);

CREATE TABLE case_finding (
  finding_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES fta_case (case_id),
  rule_id TEXT NOT NULL,
  box_code VARCHAR(8) REFERENCES ref_vat201_box (box_code),
  description TEXT NOT NULL,
  declared_vat_aed NUMERIC(18, 2),
  einvoice_vat_aed NUMERIC(18, 2),
  gap_vat_aed NUMERIC(18, 2) NOT NULL,
  invoice_count INTEGER,
  support_status TEXT,
  resolution TEXT,
  resolution_note TEXT
);

CREATE TABLE finding_invoice (
  finding_id TEXT NOT NULL REFERENCES case_finding (finding_id),
  invoice_uuid VARCHAR(36) NOT NULL REFERENCES e_invoice (invoice_uuid),
  invoice_number TEXT NOT NULL,
  vat_amount_aed NUMERIC(18, 2) NOT NULL,
  PRIMARY KEY (finding_id, invoice_uuid)
);

CREATE TABLE letter (
  letter_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES fta_case (case_id),
  direction TEXT NOT NULL,
  letter_type TEXT NOT NULL,
  sent_date DATE NOT NULL,
  deadline_date DATE,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  sent_by TEXT NOT NULL
);

CREATE TABLE case_document (
  document_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES fta_case (case_id),
  letter_id TEXT NOT NULL REFERENCES letter (letter_id),
  document_type TEXT NOT NULL,
  counterparty_tin VARCHAR(10) REFERENCES taxpayer (tin),
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,
  net_amount_aed NUMERIC(18, 2),
  vat_amount_aed NUMERIC(18, 2) NOT NULL,
  file_name TEXT NOT NULL,
  check_result TEXT NOT NULL
);

CREATE TABLE case_event (
  event_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES fta_case (case_id),
  event_ts TIMESTAMP NOT NULL,
  side TEXT NOT NULL,
  actor TEXT NOT NULL,
  step TEXT NOT NULL,
  action TEXT NOT NULL,
  ref TEXT
);

CREATE TABLE taxpayer_record (
  record_id TEXT PRIMARY KEY,
  tin VARCHAR(10) NOT NULL REFERENCES taxpayer (tin),
  record_type TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  invoice_uuid VARCHAR(36) REFERENCES e_invoice (invoice_uuid),
  counterparty_name TEXT NOT NULL,
  counterparty_trn VARCHAR(15),
  document_date DATE NOT NULL,
  booking_date DATE NOT NULL,
  booked_period_code TEXT NOT NULL,
  booked_box VARCHAR(8) NOT NULL REFERENCES ref_vat201_box (box_code),
  net_amount_aed NUMERIC(18, 2) NOT NULL,
  vat_amount_aed NUMERIC(18, 2) NOT NULL,
  payment_ref TEXT
);

CREATE TABLE agent_option (
  option_id TEXT PRIMARY KEY,
  case_type TEXT NOT NULL,
  side TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  recommended CHAR(1) NOT NULL,
  next_action TEXT NOT NULL,
  weak_option_reply TEXT
);

CREATE TABLE stand_session (
  session_id TEXT PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  role TEXT NOT NULL,
  company_tin VARCHAR(10) REFERENCES taxpayer (tin),
  started_ts TIMESTAMP NOT NULL,
  finished_ts TIMESTAMP,
  events_closed INTEGER
);

CREATE TABLE session_action (
  action_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES stand_session (session_id),
  action_ts TIMESTAMP NOT NULL,
  case_id TEXT REFERENCES fta_case (case_id),
  step TEXT NOT NULL,
  action TEXT NOT NULL,
  option_id TEXT REFERENCES agent_option (option_id),
  question_text TEXT
);
