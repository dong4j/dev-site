#!/usr/bin/env bash
set -euo pipefail

git push "$@"
open "https://dash.cloudflare.com/c52fab2d8316497e3f8982d07da90531/pages/view/dev-site"
