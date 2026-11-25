$ErrorActionPreference = 'Stop'
$diagramPython = 'C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt\dependencies\python\python.exe'
$diagramInstaller = 'C:\Users\Aymoo\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py'
$diagramDestination = 'C:\Users\Aymoo\.codex\skills'
$diagramSkills = @(
    @{ Repo='Agents365-ai/drawio-skill'; Path='skills/drawio-skill'; Name='drawio-skill'; Ref='main' },
    @{ Repo='cathrynlavery/diagram-design'; Path='skills/diagram-design'; Name='diagram-design'; Ref='main' },
    @{ Repo='tt-a1i/archify'; Path='archify'; Name='archify'; Ref='main' },
    @{ Repo='AIPris/code-to-diagram'; Path='skills/code-to-diagram'; Name='code-to-diagram'; Ref='main' },
    @{ Repo='coleam00/excalidraw-diagram-skill'; Path='.'; Name='excalidraw-diagram'; Ref='main' },
    @{ Repo='DoubleMice/plantuml-skill'; Path='.'; Name='plantuml-skill'; Ref='main' }
)
$diagramResults = @()
foreach ($diagramSkill in $diagramSkills) {
    $diagramSkillPath = Join-Path $diagramDestination $diagramSkill.Name
    if (Test-Path -LiteralPath $diagramSkillPath) {
        $diagramResults += [PSCustomObject]@{ Name=$diagramSkill.Name; Status='Already present; preserved'; Source=$diagramSkill.Repo }
        continue
    }
    & $diagramPython $diagramInstaller --repo $diagramSkill.Repo --path $diagramSkill.Path --name $diagramSkill.Name --ref $diagramSkill.Ref --dest $diagramDestination
    if ($LASTEXITCODE -ne 0) {
        $diagramResults += [PSCustomObject]@{ Name=$diagramSkill.Name; Status='FAILED'; Source=$diagramSkill.Repo }
    } else {
        $diagramResults += [PSCustomObject]@{ Name=$diagramSkill.Name; Status='Installed'; Source=$diagramSkill.Repo }
    }
}
$diagramResults | Format-Table -AutoSize
if ($diagramResults.Status -contains 'FAILED') { exit 1 }
