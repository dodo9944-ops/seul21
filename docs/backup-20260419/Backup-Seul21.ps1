<#
.SYNOPSIS
  세울엔지니어링 홈페이지 원클릭 백업 스크립트 (Windows PowerShell)

.DESCRIPTION
  - GitHub 저장소 master + backup-20260419 브랜치 ZIP을 바탕화면에 다운로드
  - 운영 문서(docs/backup-20260419) 동봉
  - Google Drive Desktop 동기화 폴더가 설치되어 있으면 00.공유폴더에 자동 복사
  - 설치된 연결 프로그램 목록·네트워크 구성 요약 텍스트 생성

.USAGE (삼성 인터넷 또는 Edge로 복사 후 PowerShell 붙여넣기)
  PowerShell 관리자 권한 필요 없음. 그냥 복사 → PowerShell 붙여넣기 → Enter.

.AUTHOR  Claude Code (Anthropic)
.DATE    2026-04-19
#>

#--- 실행 정책 임시 완화 ---
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Continue'

#--- 설정 ---
$Today       = Get-Date -Format 'yyyyMMdd_HHmm'
$RepoOwner   = 'dodo9944-ops'
$RepoName    = 'seul21'
$Branches    = @('master', 'backup-20260419')
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$BackupRoot  = Join-Path $DesktopPath "세울21_백업_$Today"
$LogPath     = Join-Path $BackupRoot 'backup-log.txt'

#--- 로그 함수 ---
function Write-Log {
    param([string]$Msg, [string]$Level = 'INFO')
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $line = "[$ts][$Level] $Msg"
    Write-Host $line
    if (Test-Path $BackupRoot) { Add-Content -Path $LogPath -Value $line -Encoding UTF8 }
}

#--- 시작 ---
Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '  세울엔지니어링 홈페이지 종합 백업' -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

#--- 백업 폴더 생성 ---
New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackupRoot 'source') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackupRoot 'docs') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackupRoot 'environment') -Force | Out-Null
Write-Log "백업 폴더 생성: $BackupRoot"

#=============================================================================
# STEP 1. GitHub 저장소 ZIP 다운로드
#=============================================================================
Write-Host ''
Write-Host '▣ STEP 1. GitHub 저장소 ZIP 다운로드' -ForegroundColor Yellow
foreach ($branch in $Branches) {
    $url      = "https://github.com/$RepoOwner/$RepoName/archive/refs/heads/$branch.zip"
    $zipPath  = Join-Path $BackupRoot "source\${RepoName}_${branch}_${Today}.zip"
    Write-Log "다운로드 시작: $url"
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing -TimeoutSec 300
        $size = (Get-Item $zipPath).Length / 1MB
        Write-Log ("다운로드 완료: {0} ({1:N2} MB)" -f $zipPath, $size) 'OK'
    } catch {
        Write-Log "다운로드 실패: $branch - $($_.Exception.Message)" 'ERROR'
    }
}

#--- 다운로드한 ZIP 중 하나를 source/extracted에 풀기 (master 기준) ---
$masterZip = Join-Path $BackupRoot "source\${RepoName}_master_${Today}.zip"
if (Test-Path $masterZip) {
    $extractPath = Join-Path $BackupRoot 'source\extracted'
    try {
        Expand-Archive -Path $masterZip -DestinationPath $extractPath -Force
        Write-Log "master 브랜치 압축 해제 완료: $extractPath" 'OK'
    } catch {
        Write-Log "압축 해제 실패: $($_.Exception.Message)" 'ERROR'
    }
}

#=============================================================================
# STEP 2. 운영 문서(docs/backup-20260419) 로컬 사본 생성
#=============================================================================
Write-Host ''
Write-Host '▣ STEP 2. 운영 문서 사본 생성' -ForegroundColor Yellow
$extractedDocs = Join-Path $BackupRoot 'source\extracted'
$docsSource = Get-ChildItem -Path $extractedDocs -Directory -Filter "${RepoName}-*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($docsSource) {
    $srcDocs = Join-Path $docsSource.FullName 'docs\backup-20260419'
    if (Test-Path $srcDocs) {
        Copy-Item -Path "$srcDocs\*" -Destination (Join-Path $BackupRoot 'docs') -Recurse -Force
        Write-Log "운영 문서 복사 완료" 'OK'
    } else {
        Write-Log "경고: docs/backup-20260419 폴더를 찾을 수 없음" 'WARN'
    }
}

#=============================================================================
# STEP 3. 설치된 연결 프로그램 목록 수집
#=============================================================================
Write-Host ''
Write-Host '▣ STEP 3. 설치된 연결 프로그램 목록 수집' -ForegroundColor Yellow
$envReport = Join-Path $BackupRoot 'environment\환경정보.txt'
@"
세울엔지니어링 홈페이지 작업 환경 보고서
==========================================
작성 시각: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
PC 이름  : $env:COMPUTERNAME
사용자명 : $env:USERNAME
OS       : $((Get-CimInstance Win32_OperatingSystem).Caption) $((Get-CimInstance Win32_OperatingSystem).Version)

== 주요 연결 프로그램 설치 여부 ==
"@ | Out-File -FilePath $envReport -Encoding UTF8

$progsToCheck = @(
    @{ Name='Git';             Cmd='git --version' },
    @{ Name='GitHub CLI (gh)'; Cmd='gh --version' },
    @{ Name='Node.js';         Cmd='node --version' },
    @{ Name='npm';             Cmd='npm --version' },
    @{ Name='Python';          Cmd='python --version' },
    @{ Name='VS Code';         Cmd='code --version' },
    @{ Name='Vercel CLI';      Cmd='vercel --version' }
)
foreach ($p in $progsToCheck) {
    try {
        $out = Invoke-Expression $p.Cmd 2>&1 | Select-Object -First 1
        Add-Content -Path $envReport -Value "  [설치됨] $($p.Name): $out" -Encoding UTF8
    } catch {
        Add-Content -Path $envReport -Value "  [미설치] $($p.Name)" -Encoding UTF8
    }
}

#--- 설치된 브라우저 목록 ---
Add-Content -Path $envReport -Value "`n== 설치된 브라우저 (삼성 인터넷/Edge 권장) ==" -Encoding UTF8
$browsers = @(
    'HKLM:\SOFTWARE\Clients\StartMenuInternet',
    'HKCU:\SOFTWARE\Clients\StartMenuInternet'
)
foreach ($path in $browsers) {
    if (Test-Path $path) {
        Get-ChildItem $path | ForEach-Object {
            Add-Content -Path $envReport -Value "  - $($_.PSChildName)" -Encoding UTF8
        }
    }
}

#--- 네트워크 설정 요약 ---
Add-Content -Path $envReport -Value "`n== 네트워크 설정 ==" -Encoding UTF8
try {
    $ipInfo = (ipconfig | Out-String)
    Add-Content -Path $envReport -Value $ipInfo -Encoding UTF8
} catch { }

#--- seul21.com DNS 조회 ---
Add-Content -Path $envReport -Value "`n== seul21.com DNS 조회 ==" -Encoding UTF8
try {
    $dns = Resolve-DnsName -Name 'seul21.com' -ErrorAction SilentlyContinue | Out-String
    Add-Content -Path $envReport -Value $dns -Encoding UTF8
} catch { }

Write-Log "환경정보 보고서 생성: $envReport" 'OK'

#=============================================================================
# STEP 4. Google Drive Desktop 동기화 폴더 검출 + 복사
#=============================================================================
Write-Host ''
Write-Host '▣ STEP 4. Google Drive 자동 복사 시도' -ForegroundColor Yellow
$gDrivePaths = @(
    "$env:USERPROFILE\Google 드라이브",
    "$env:USERPROFILE\Google Drive",
    "$env:USERPROFILE\GoogleDrive",
    "G:\내 드라이브",
    "G:\My Drive",
    "H:\내 드라이브",
    "H:\My Drive"
)
$gDriveFound = $null
foreach ($p in $gDrivePaths) {
    if (Test-Path $p) { $gDriveFound = $p; break }
}

if ($gDriveFound) {
    Write-Log "Google Drive 동기화 폴더 발견: $gDriveFound" 'OK'
    $sharedFolder = Join-Path $gDriveFound '00.공유폴더\세울21_백업'
    if (-not (Test-Path $sharedFolder)) {
        New-Item -ItemType Directory -Path $sharedFolder -Force | Out-Null
    }
    $driveBackup = Join-Path $sharedFolder "세울21_백업_$Today"
    try {
        Copy-Item -Path $BackupRoot -Destination $driveBackup -Recurse -Force
        Write-Log "Google Drive 복사 완료: $driveBackup" 'OK'
        Write-Host "  → Google Drive 동기화가 완료되면 클라우드에 자동 업로드됩니다." -ForegroundColor Green
    } catch {
        Write-Log "Google Drive 복사 실패: $($_.Exception.Message)" 'ERROR'
    }
} else {
    Write-Log "Google Drive Desktop이 설치되지 않았거나 동기화 경로를 찾지 못했습니다." 'WARN'
    Write-Host ''
    Write-Host '▣ Google Drive 수동 업로드 안내' -ForegroundColor Yellow
    Write-Host "  1. drive.google.com 접속 (삼성 인터넷 또는 Edge)" -ForegroundColor White
    Write-Host "  2. 00.공유폴더 → 세울21_백업 폴더로 이동" -ForegroundColor White
    Write-Host "  3. 다음 폴더를 드래그 업로드:" -ForegroundColor White
    Write-Host "     $BackupRoot" -ForegroundColor Cyan
}

#=============================================================================
# STEP 5. 요약 보고서 생성
#=============================================================================
Write-Host ''
Write-Host '▣ STEP 5. 요약 보고서 생성' -ForegroundColor Yellow
$summary = Join-Path $BackupRoot 'BACKUP_SUMMARY.md'
$sizeTotal = (Get-ChildItem $BackupRoot -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
@"
# 세울21 홈페이지 백업 요약

- **백업 시각**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- **백업 위치(로컬)**: $BackupRoot
- **총 용량**: $([math]::Round($sizeTotal, 2)) MB
- **PC**: $env:COMPUTERNAME / $env:USERNAME

## 포함 내용
- \`source/\` — GitHub 저장소 ZIP ($(($Branches -join ', ')))
- \`source/extracted/\` — master 브랜치 압축 해제본
- \`docs/\` — 홈페이지 운영 문서 세트 (구조도·설명서·유지관리설명서 등)
- \`environment/환경정보.txt\` — PC 환경·설치 프로그램·네트워크 정보
- \`backup-log.txt\` — 백업 실행 로그

## Google Drive
$(if ($gDriveFound) { "- 자동 복사 완료: $driveBackup" } else { "- 미설치: drive.google.com 에서 수동 업로드 필요" })

## 다음 단계
1. 이 폴더를 압축하여 별도 외장 디스크에 추가 보관 권장
2. 로그인정보_템플릿(06번 문서)에 실제 비밀번호 기입 후 암호화된 비밀번호 매니저에 보관
3. 분기마다 본 스크립트를 재실행하여 최신본 유지
"@ | Out-File -FilePath $summary -Encoding UTF8
Write-Log "요약 보고서 생성: $summary" 'OK'

#=============================================================================
# 완료
#=============================================================================
Write-Host ''
Write-Host '============================================' -ForegroundColor Green
Write-Host '  백업 완료!' -ForegroundColor Green
Write-Host '============================================' -ForegroundColor Green
Write-Host ''
Write-Host "  바탕화면 위치: $BackupRoot" -ForegroundColor White
Write-Host "  총 용량     : $([math]::Round($sizeTotal, 2)) MB" -ForegroundColor White
if ($gDriveFound) {
    Write-Host "  Google Drive: 자동 복사 완료" -ForegroundColor Green
} else {
    Write-Host "  Google Drive: 수동 업로드 필요" -ForegroundColor Yellow
}
Write-Host ''
Write-Host '  폴더 열기 → 탐색기에서 자동으로 열립니다...' -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process explorer.exe -ArgumentList $BackupRoot
