# >>> Git-guard by Sulaiman Misri >>>
$env:GIT_GUARD_ALLOWED_BRANCH = "staging"

$OriginalGit = (Get-Command git -CommandType Application -ErrorAction SilentlyContinue).Source
if (-not $OriginalGit) { $OriginalGit = "git.exe" }

function git {
    if ($args.Count -gt 0 -and $args[0] -eq "pull") {
        $pullArgs = $args[1..$args.Count]
        & git-guard @pullArgs
        return
    }
    & $OriginalGit @args
}
# <<< Git-guard <<<
