export type Role = 'FTA_SPECIALIST' | 'BUSINESS'
export type CaseType = 'RETURN_VS_EINVOICES' | 'REFUND_REVIEW' | 'NON_FILER'
export type StepId =
  | 'SIGNAL'
  | 'CHECK'
  | 'EXPLAIN'
  | 'DECIDE'
  | 'ACT'
  | 'FOLLOW_UP'
  | 'CLOSED'
  | 'DONE'

export type ScreenId =
  | '01_name'
  | '02_role'
  | 'prep_fta'
  | 'prep_biz'
  | '03_briefing'
  | '04_c1_explain'
  | '05_c1_documents'
  | '06_c1_act'
  | '07_c1_followup'
  | '07b_c1_closed'
  | 'R1_refund_explain'
  | 'R1b_supplier_check'
  | 'R2_refund_act'
  | 'R3_refund_followup'
  | '16_query_table'
  | '18_summary'
  | 'B01_company'
  | 'Y1_home'
  | 'Y2_explain'
  | 'Y2b_documents'
  | 'Y3_act'
  | 'Y4_followup'
  | 'W1_home'
  | 'W2_explain'
  | 'W2b_paper_invoice'
  | 'W3_act'
  | 'W4_followup'
  | 'Q1_query'
  | 'Z1_summary'

export type ActivityItem = {
  label: string
  status: 'done' | 'pending' | 'wait'
}

export type OptionItem = {
  id: string
  label: string
  recommended?: boolean
  weak?: boolean
  weakReply?: string
  tone?: 'default' | 'danger'
}
