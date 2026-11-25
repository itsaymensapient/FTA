const fs=require('fs'),path=require('path');
const base=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(base,'cloudera-hosting-manifest.json'),'utf8'));
const urls={
 deploy:'https://docs.cloudera.com/machine-learning/cloud/use-ai-studios/topics/ml-deploy-workflow-model-endpoint.html',
 features:'https://docs.cloudera.com/machine-learning/cloud/use-ai-studios/topics/ml-agent-studio-key-features.html',
 preview:'https://docs.cloudera.com/machine-learning/cloud/use-ai-studios/topics/ml-ai-studios-overview.html',
 security:'https://docs.cloudera.com/machine-learning/cloud/use-ai-studios/topics/ml-agent-studio-security-recommendations.html',
 apps:'https://docs.cloudera.com/machine-learning/cloud/applications/topics/ml-applications-c.html',
 infer:'https://docs.cloudera.com/machine-learning/cloud/setup-cloudera-ai-inference/topics/ml-caii-use-caii.html',
 prereq:'https://docs.cloudera.com/machine-learning/cloud/setup-cloudera-ai-inference/topics/ml-caii-prerequisites-set-up.html',
 data:'https://docs.cloudera.com/machine-learning/cloud/setup-data-connections/index.html',
 ranger:'https://docs.cloudera.com/runtime/7.3.1/impala-secure/topics/impala-row-level-filtering.html',
 container:'https://docs.cloudera.com/machine-learning/cloud/ai-inference/topics/ml-caii-application-deploy.html',
 jobs:'https://docs.cloudera.com/machine-learning/cloud/jobs-pipelines/topics/ml-creating-a-job-c.html',
 tools:'https://docs.cloudera.com/machine-learning/cloud/use-ai-studios/topics/ml-create-custom-tools.html'
};
const link=(key,label)=>`<a href="${urls[key]}">${label}</a>`;
const diagram=(i)=>{const m=manifest[i];let svg=fs.readFileSync(path.join(base,m.slug+'.svg'),'utf8').replace(/<\?xml[^>]*\?>/g,'');return `<figure><div class="figure">${svg}</div><figcaption>${m.title} · <a href="${m.slug}.svg">SVG</a> · <a href="${m.slug}.png">PNG</a> · <a href="${m.slug}.html">Individual diagram</a></figcaption></figure>`;};
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FTA — hosting agents on Cloudera</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#182C3A;font:18px/1.65 'Segoe UI',Arial,sans-serif}main{max-width:1600px;margin:auto;padding:48px 32px}h1{font-size:42px;line-height:1.18;max-width:1050px}h2{font-size:30px;line-height:1.3;margin-top:44px}h3{font-size:23px}p,li{max-width:1120px}a{color:#14665E;text-underline-offset:3px}.meta,figcaption{font-size:15px;color:#536674}nav{border-block:1px solid #D8E0E5;padding:18px 0;margin:30px 0}li{margin:9px 0}.note{background:#EEF7F4;border-left:4px solid #14665E;padding:16px 22px;max-width:1200px}.neutral{background:#F5F7F8;padding:16px 22px;max-width:1200px}figure{margin:26px 0}.figure{overflow:auto;border:1px solid #D8E0E5}.figure svg{display:block;width:100%;min-width:1100px;height:auto}table{border-collapse:collapse;width:100%;font-size:16px;margin:24px 0}th,td{text-align:left;vertical-align:top;padding:14px;border-bottom:1px solid #D8E0E5}th{background:#F5F7F8}th:first-child{width:22%}td:nth-child(2){width:19%}code,pre{font-family:Consolas,monospace}pre{font-size:15px;line-height:1.6;background:#F5F7F8;padding:20px;overflow:auto}section{border-bottom:1px solid #D8E0E5;padding-bottom:28px}footer{font-size:15px;color:#536674;margin-top:32px}@media print{main{padding:0}.figure svg{min-width:0}figure{break-inside:avoid}nav{display:none}}
</style></head><body><main>
<header><p class="meta">FTA / AGENTIC AI / CLOUDERA HOSTING · PROPOSAL · 23 NOVEMBER 2026</p><h1>How we can host our agents on Cloudera</h1>
<p><strong>Recommended GITEX reference path:</strong> develop in Cloudera AI Workbench, configure the multi-agent workflow in Agent Studio, publish it as a Workbench workflow endpoint, and connect our demo interface. Use an approved language-model endpoint and controlled connections to Gold and the demo backend.</p>
<p class="note"><strong>The key distinction:</strong> an agent is a role, instructions, tasks and permitted tools running in our application. It is not automatically a separate server or a newly trained model. Several agents can share one workflow runtime and one LLM endpoint.</p>
<p>This guide assumes a Cloudera AI on Cloud reference deployment. FTA’s cloud/on-premises edition, installed release, network arrangement and licensing have not been supplied. Product capabilities below come from official documentation; placement, responsibilities and application controls are our proposed design.</p>
<p class="neutral"><strong>Release decision to confirm:</strong> the reviewed ${link('preview','AI Studios overview')} labels Studios Technical Preview and recommends test/development use. Other workflow pages describe deployment endpoints. For the POC, assess the target release with Cloudera; do not treat those deployment pages as proof of production approval.</p></header>
<nav aria-label="Contents"><strong>Read in this order</strong><ol><li><a href="#hosting">Where the software runs</a></li><li><a href="#services">Which services we need and why</a></li><li><a href="#deploy">How we deploy it</a></li><li><a href="#request">A complete hosted request</a></li><li><a href="#alternatives">Hosting alternatives and resource planning</a></li><li><a href="#questions">Questions for Cloudera and ownership</a></li></ol></nav>
<section id="hosting"><h2>1. Where the software runs</h2>
<p>In the documented Agent Studio deployment, the workflow engine is a <strong>Workbench Model</strong> and the interface is a <strong>Workbench Application</strong>. Here, “Model” is the deployment object running the workflow; the language model can be a separate service. ${link('deploy','Workflow deployment documentation')}.</p>
${diagram(0)}
<p><strong>Inside our CPU workflow:</strong> the supervisor resolves the task, loads Ali’s reviewed instruction sections, builds a bounded plan and coordinates specialists. Specialist tasks call the tools for SQL, calculations, reference lookup and actions. We can package these tools with the workflow initially; a separate tool server is justified when access boundaries, reuse or independent scaling require it.</p>
<p><strong>Outside the workflow:</strong> the LLM produces plans and language; the warehouse returns records; backend services persist cases and execute authorized effects. The model cannot turn a proposed adjustment into a committed business change by itself.</p>
<p><strong>Security detail:</strong> a Workbench login protects access to the application, but it does not by itself implement taxpayer-level authorization. Our backend supplies trusted role/company scope and tools enforce it. With a shared service account, Ranger sees that service identity unless a supported delegation mechanism is explicitly configured. Test scoped views/policies and application authorization together. ${link('security','Agent Studio security recommendations')}; ${link('ranger','Ranger row filtering')}.</p>
</section>
<section id="services"><h2>2. Which services do we need?</h2>
<p>“Core” means a capability the demo needs. It does not mean a new product must be purchased if FTA already has an appropriate service.</p>
<table><thead><tr><th>Service / component</th><th>Need in this proposal</th><th>What it does for our FTA agents</th></tr></thead><tbody>
<tr><td><strong>Cloudera AI Workbench</strong></td><td>Core hosting/development path</td><td>Workspace for project code, dependencies and tests. Its Application hosts the demo interface; the published workflow uses a Workbench Model endpoint. The development notebook is not the live demo endpoint.</td></tr>
<tr><td><strong>Agent Studio</strong></td><td>Chosen POC orchestration option; release-dependent</td><td>Configure manager/specialist tasks, attach tools, test and publish. It accelerates authoring; it does not remove the need for our domain logic and backend controls. A code-based workflow can be evaluated if Studio is unsuitable. ${link('features','Documented capabilities')}.</td></tr>
<tr><td><strong>LLM endpoint</strong></td><td>Core capability</td><td>Generates plans and explanations. Use Cloudera AI Inference for a model hosted under the agreed platform controls, or another approved provider endpoint. Benchmark tool calling, structured output, evidence fidelity and Arabic/English behavior.</td></tr>
<tr><td><strong>Cloudera AI Inference</strong></td><td>Conditional: selected self-hosted model-serving route</td><td>Serves the chosen language model over an API. Its compute is separate from the CPU agent workflow; accelerator needs depend on model size/runtime and performance targets. ${link('infer','Inference overview')}.</td></tr>
<tr><td><strong>Cloudera AI Registry</strong></td><td>Dependency when using AI Inference</td><td>Register and select the model version used by the serving endpoint. Current cloud prerequisites require Registry in the same environment before provisioning AI Inference. It is not a replacement for application source control. ${link('prereq','Inference prerequisites')}.</td></tr>
<tr><td><strong>Data Warehouse / existing Impala or Hive SQL endpoint</strong></td><td>Core governed data access; reuse existing Gold platform</td><td>The Data tool queries curated invoice, return and ledger data. Workbench documents Hive/Impala data connections. Validate SQL and enforce trusted scope before execution; return source IDs and snapshots. ${link('data','Data connection setup')}.</td></tr>
<tr><td><strong>Identity, service accounts and Ranger policies</strong></td><td>Core controls</td><td>Authenticate the runtime and limit data access. The application still decides which visitor may act for which company. Service-account credentials stay server-side. Ranger policies must be configured and verified against the actual query identity.</td></tr>
<tr><td><strong>Approved instruction/document storage</strong></td><td>Core; reuse controlled storage</td><td>Versioned files for Ali’s guidance sections; reference documents for citations. For a small demo, package instruction sections with the release. Larger libraries can live in approved object/document storage with access and version controls.</td></tr>
<tr><td><strong>Retrieval index + embedding endpoint / RAG Studio</strong></td><td>Conditional</td><td>Add semantic search if the approved document collection needs it. Exact section lookup is sufficient for known instruction IDs. RAG Studio is an optional accelerator, not a requirement to build SQL agents. Gold rows remain queried through SQL; the document index supports reference retrieval.</td></tr>
<tr><td><strong>Durable case/approval store + action APIs</strong></td><td>Core custom/backend components</td><td>Save case state, evidence, approved payloads, operation keys and event history. Integrate a suitable existing transactional database/backend; keep all POC submissions inside demo APIs. These business components are not automatically generated by selecting an agent product.</td></tr>
<tr><td><strong>Agent Ops & Metrics / Phoenix</strong></td><td>Included observability path with Studio; configure access/retention</td><td>Inspect workflow traces, tool calls, latency and model usage. Telemetry explains a run; the durable case store records business state. Avoid unnecessary sensitive content in logs. ${link('features','Monitoring features')}.</td></tr>
<tr><td><strong>Workbench Jobs / existing event scheduler</strong></td><td>Conditional supporting capability</td><td>Jobs can seed/reset synthetic data, refresh a document index or run scheduled checks. Persist human waits in case state; implement the GITEX demo clock and follow-up rules deliberately. A cron schedule alone is not case management. ${link('jobs','Jobs documentation')}.</td></tr>
</tbody></table>
<p><strong>Not automatically required for this agent layer:</strong> a new training pipeline, a dedicated GPU per agent, Fine-tuning Studio, Synthetic Data Studio, Kafka, NiFi or a new Data Engineering service. Add these only for a demonstrated requirement. Existing Silver → ML → Gold processing continues to supply the agent layer.</p>
</section>
<section id="deploy"><h2>3. How we deploy it, step by step</h2>${diagram(1)}
<h3>Prepare one versioned project</h3><p>The following is a proposed code structure, not files already implemented by this diagram task:</p>
<pre>fta-agent-demo/
  app.py                         # Business / Inspector UI and server adapter
  workflows/                     # Supervisor and specialist task definitions
  instructions/                  # Reviewed sections loaded before execution
    return_reconciliation.md
    invoice_checks.md
    refund_evidence.md
    disclosure_periods.md
  tools/
    gold_reader.py               # Scoped, read-only evidence retrieval
    reconciliation.py            # Deterministic arithmetic and checks
    reference_lookup.py          # Approved passage retrieval
    demo_action_client.py        # Calls backend approval/submission/status APIs
  tests/                         # Scenario, access and action acceptance checks
  requirements.txt               # Pinned dependencies
  release_manifest.json          # Code, instruction and formula versions</pre>
<p><strong>Configure Studio:</strong> use the supported prebuilt containerized Studio runtime. The reviewed security page deprecates the old source/AMP deployment paths. Attach only the tools needed by each specialist, and configure the model endpoint through the supported provider settings. ${link('security','Runtime and service-account guidance')}; ${link('tools','Custom tool configuration')}.</p>
<p><strong>Publish and connect the interface:</strong> use Studio’s documented workflow publication path, then bind the custom UI’s server-side adapter to the published APIs. Start runs, retain their trace IDs and retrieve progress/results. Do not expose endpoint credentials in the visitor’s browser. The ${link('apps','Workbench Application documentation')} describes project-based web app deployment and runtime port settings.</p>
<p><strong>Deployment gates:</strong> check the reference arithmetic, cross-company access, injection attempts, missing evidence, stale previews, approval cancellation, repeated submissions, timeout recovery, role switching and visitor reset. Rehearse the four GITEX stories with the exact deployed release.</p>
</section>
<section id="request"><h2>4. What happens when someone uses the hosted agents?</h2>${diagram(2)}
<p><strong>Junior-engineer walkthrough:</strong> the user asks a question in our app. The backend adds trusted company/case context. The workflow loads the approved section and asks the model for a plan. The application validates the plan and specialist tools retrieve and calculate the evidence. The model then writes an explanation from those results; output checks run before display.</p>
<p>For Al Yasmeen, the draft evidence supports Dubai <strong>+486,200</strong> and Abu Dhabi <strong>−74,200</strong>, giving <strong>AED 412,000 net</strong>. An optional correction is previewed first. Approval starts the controlled action path; a backend service checks the exact payload, permissions and record freshness, then tracks and verifies the demo operation.</p>
<p><strong>Human pauses:</strong> finish the explanatory run and persist a pending approval in case state. On approval, start or resume the action path using that stored state and the reviewed payload. Do not hold an in-memory worker open for days, and do not infer approval from a model-generated statement.</p>
</section>
<section id="alternatives"><h2>5. Hosting alternatives and resource planning</h2>
<h3>A. Agent Studio + Workbench — the reference POC path</h3><p>Use the published workflow engine and a Workbench interface. This is the illustrated option. It suits a controlled prototype if the installed Studio release and access arrangement are acceptable. Our application still implements the case/action controls.</p>
<h3>B. Our own code-based agent application</h3><p>If Studio’s capabilities or release status do not fit, package the supervisor, specialist workflows and tools as application code. Workbench supports custom web applications. We take responsibility for the execution adapter, background work, tracing, deployment testing and durable state. Confirm the supported deployment pattern with Cloudera before selecting it for production.</p>
<h3>C. Cloudera AI Inference Applications — a separate hosting option to assess</h3><p>Current cloud documentation also describes deploying applications from Git or container images on AI Inference infrastructure, with SSO/JWT authentication options and replica controls. The app listens on 8080 and is exposed through HTTPS. The documented path requires a new AI Inference service instance for applications; do not assume an existing model-serving instance can host it. This is an alternative for a custom application, not an automatic relocation of a published Studio workflow. ${link('container','AI Inference Applications deployment')}.</p>
<h3>What resources should we request?</h3><ul>
<li><strong>CPU application capacity:</strong> the user interface, workflow and ordinary Python/tool execution. Start with one deployed instance of each role in the demo plan and validate concurrency. This is an initial topology, not a high-availability design.</li>
<li><strong>Model-serving capacity:</strong> select the LLM, context length, expected concurrent requests and latency target before specifying GPUs or memory. Several agent roles can reuse one model endpoint.</li>
<li><strong>Storage and database capacity:</strong> allow for evidence, attachments, durable cases, approval history, logs and retention. Worker RAM and temporary files are not the business record.</li>
<li><strong>Network and readiness:</strong> verify model, SQL and backend connectivity under the actual service identity. Prewarm the demo and test the first request, not only subsequent requests.</li>
</ul>
<p>For the cloud AI Inference route, the reviewed prerequisites specify a compute-cluster-enabled environment, a separate compute cluster, same-environment Registry and an environment-level customer-managed encryption key. Ask the platform team to validate the matching release requirements. ${link('prereq','Current cloud setup prerequisites')}.</p>
</section>
<section id="questions"><h2>6. What to agree with Cloudera before implementation</h2><ol>
<li><strong>Target platform:</strong> What exact Cloudera edition, release, region/site and service entitlements will host the demo?</li>
<li><strong>Studio status:</strong> Is the intended Agent Studio build supported for our POC and later production? What is the supported alternative if not?</li>
<li><strong>Hosting path:</strong> Use Workbench Application + published workflow, custom Workbench code, or AI Inference Applications? Which team owns publication and rollback?</li>
<li><strong>LLM endpoint:</strong> Which model and serving runtime are available? What are their tool-call, JSON, Arabic and concurrency results? Who provides capacity?</li>
<li><strong>Data access:</strong> Where is Gold queried? Which identity reaches Impala/Hive, and how are company scope and Inspector permissions enforced?</li>
<li><strong>Visitor access:</strong> Will the demo use named Workbench users, an approved kiosk session or another authenticated application path? Do not disable authentication as the access design.</li>
<li><strong>Backend integration:</strong> Who supplies persistent cases, approvals, demo action APIs, operation status and revalidation data?</li>
<li><strong>Operations:</strong> What are the timeout, concurrency, restart, backup, log-retention, reset and cold-start behaviors?</li>
</ol>
<p><strong>Your proposed ownership as AI engineer:</strong> workflow/task design, instruction loading, tool adapters, model integration, evidence-backed explanations and evaluation. <strong>Platform team / Cloudera:</strong> provision and support the environment, runtime, model-serving route, network and credentials. <strong>Data/backend/domain teams:</strong> reliable Gold contracts, durable state/APIs and approved tax/business meaning. Agree the split as a team.</p>
</section>
<footer>Prepared using the diagram-design skill. Official Cloudera pages were checked on 23 November 2026. Scenario figures come from the supplied synthetic GITEX draft. These artifacts are a proposed hosting design, not a deployed application, confirmed bill of materials or production support statement.</footer>
</main></body></html>`;
fs.writeFileSync(path.join(base,'FTA-Cloudera-agent-hosting-guide.html'),html);
fs.writeFileSync(path.join(base,'cloudera-hosting-README.txt'),'Open FTA-Cloudera-agent-hosting-guide.html first. It includes all three diagrams inline, a service checklist, deployment walkthrough, worked scenario and official source links.\n\nIndividual diagrams are supplied as SVG, PNG and HTML. This is a proposed Cloudera AI on Cloud reference design; the target FTA edition, release, licenses, network and production support must be confirmed. No infrastructure has been deployed.\n\nCreated with diagram-design. Official documentation checked 23 November 2026.\n');
console.log('Created hosting guide with '+manifest.length+' inline diagrams and official source links.');
