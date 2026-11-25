import type { ScreenId } from '@/data/types'
import { useStand } from '@/session/StandSession'
import {
  BriefingScreen,
  CompanyChooserScreen,
  NameScreen,
  PrepBizScreen,
  PrepFtaScreen,
  RoleScreen,
} from '@/screens/EntryScreens'
import {
  C1ActFta,
  C1ClosedFta,
  C1DocumentsFta,
  C1ExplainFta,
  C1FollowupFta,
  Y1Home,
  Y2bDocuments,
  Y2Explain,
  Y3Act,
  Y4Followup,
} from '@/screens/Case1Screens'
import {
  R1bSupplierCheck,
  R1RefundExplain,
  R2RefundAct,
  R3RefundFollowup,
  W1Home,
  W2bPaperInvoice,
  W2Explain,
  W3Act,
  W4Followup,
} from '@/screens/Case2Screens'
import { BizSummaryScreen, FtaSummaryScreen, QueryScreen } from '@/screens/SummaryScreens'
import type { ComponentType } from 'react'

const SCREENS: Record<ScreenId, ComponentType> = {
  '01_name': NameScreen,
  '02_role': RoleScreen,
  prep_fta: PrepFtaScreen,
  prep_biz: PrepBizScreen,
  '03_briefing': BriefingScreen,
  '04_c1_explain': C1ExplainFta,
  '05_c1_documents': C1DocumentsFta,
  '06_c1_act': C1ActFta,
  '07_c1_followup': C1FollowupFta,
  '07b_c1_closed': C1ClosedFta,
  R1_refund_explain: R1RefundExplain,
  R1b_supplier_check: R1bSupplierCheck,
  R2_refund_act: R2RefundAct,
  R3_refund_followup: R3RefundFollowup,
  '16_query_table': QueryScreen,
  '18_summary': FtaSummaryScreen,
  B01_company: CompanyChooserScreen,
  Y1_home: Y1Home,
  Y2_explain: Y2Explain,
  Y2b_documents: Y2bDocuments,
  Y3_act: Y3Act,
  Y4_followup: Y4Followup,
  W1_home: W1Home,
  W2_explain: W2Explain,
  W2b_paper_invoice: W2bPaperInvoice,
  W3_act: W3Act,
  W4_followup: W4Followup,
  Q1_query: QueryScreen,
  Z1_summary: BizSummaryScreen,
}

export default function App() {
  const { screen } = useStand()
  const Screen = SCREENS[screen] ?? NameScreen
  return <Screen />
}
