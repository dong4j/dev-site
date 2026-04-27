#!/usr/bin/env bash
set -euo pipefail

AI_CLI="${AI_CLI:-claude}"

git add -A

git diff --cached --quiet && {
  echo "没有可提交的变更"
  exit 0
}

changed_files="$(git diff --cached --name-status)"

only_md=true
while IFS=$'\t' read -r status file extra; do
  target="${extra:-$file}"
  [[ "$target" == *.md ]] || {
    only_md=false
    break
  }
done <<< "$changed_files"

title_from_md() {
  local file="$1"
  local title=""

  [[ -f "$file" ]] && title="$(grep -m 1 '^# ' "$file" 2>/dev/null | sed 's/^# *//; s/[[:space:]]*$//')"

  [[ -n "$title" ]] && echo "$title" || basename "$file" .md
}

md_msg() {
  local total status file extra target title
  total="$(echo "$changed_files" | sed '/^$/d' | wc -l | tr -d ' ')"

  if [[ "$total" == "1" ]]; then
    IFS=$'\t' read -r status file extra <<< "$changed_files"
    target="${extra:-$file}"
    title="$(title_from_md "$target")"

    case "$status" in
      A) echo "docs: 新增《${title}》" ;;
      M) echo "docs: 更新《${title}》" ;;
      D) echo "docs: 删除《${title}》" ;;
      R*) echo "docs: 重命名《${title}》" ;;
      *) echo "docs: 更新《${title}》" ;;
    esac
  else
    echo "docs: 更新博客文章"
  fi
}

ai_msg() {
  prompt="$(
    cat <<EOF
根据 Git staged 变更摘要生成一行 Conventional Commit。
只输出提交信息，不要解释。subject 使用中文。

变更文件:
$(git diff --cached --name-status | head -n 50)

变更统计:
$(git diff --cached --stat)
EOF
  )"

  case "$AI_CLI" in
    claude) echo "$prompt" | claude -p --output-format text ;;
    codex) echo "$prompt" | codex exec ;;
    *) echo "chore: 更新博客项目" ;;
  esac
}

if [[ "$only_md" == "true" ]]; then
  msg="$(md_msg)"
else
  msg="$(ai_msg)"
fi

msg="$(
  echo "$msg" |
    head -n 1 |
    sed 's/^["'"'"']//; s/["'"'"']$//' |
    sed 's/^`//; s/`$//' |
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
)"

[[ -z "$msg" ]] && msg="chore: 更新博客项目"

echo "$msg"

git commit -m "$msg"
git push

open "https://dash.cloudflare.com/c52fab2d8316497e3f8982d07da90531/pages/view/dev-site"
