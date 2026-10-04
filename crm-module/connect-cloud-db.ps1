param(
    [int]$LocalPort = 15438
)

$ErrorActionPreference = 'Stop'
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw 'Google Cloud SDK is required.'
}
if ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object Port -eq $LocalPort) {
    throw "Local port $LocalPort is already in use."
}

$forward = "${LocalPort}:127.0.0.1:5433"
Write-Host "Forwarding localhost:$LocalPort to the private GCP PostgreSQL service. Keep this terminal open."
gcloud compute ssh nextgen-erp-core-vm --project=nextgen-erp-7753216 --zone=us-central1-a --tunnel-through-iap `
    --command=true --ssh-flag='-N' --ssh-flag="-L $forward"
if ($LASTEXITCODE -ne 0) { throw 'CRM database tunnel failed.' }
