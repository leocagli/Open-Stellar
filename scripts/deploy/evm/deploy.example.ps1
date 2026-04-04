param(
  [Parameter(Mandatory = $false)]
  [string]$RpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545",
  [Parameter(Mandatory = $false)]
  [string]$ChainId = "97"
)

Write-Host "EVM deploy template" -ForegroundColor Cyan
Write-Host "RPC: $RpcUrl"
Write-Host "ChainId: $ChainId"
Write-Host "Compile and deploy contracts/evm/*.sol with your preferred toolchain." -ForegroundColor Yellow
Write-Host "Then update lib/bnb-contracts.ts with deployed addresses." -ForegroundColor Yellow
