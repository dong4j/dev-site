#!/usr/bin/env bash
set -euo pipefail

AI_CLI="${AI_CLI:-codex}"

git add -A

if git diff --cached --quiet; then
  echo "没有可提交的变更"
  exit 0
fi

# staged 文件列表，格式: A path / M path / D path
changed_files="$(git diff --cached --name-status)"

# 是否全部都是 md 文件
only_md=true
while IFS=$'\t' read -r status file extra; do
  # 兼容 rename: R100 old new，此时真正的新文件名在 extra
  target="${extra:-$file}"

  if [[ ! "$target" =~ \.md$ ]]; then
    only_md=false
    break
  fi
done <<< "$changed_files"

get_title_from_md() {
  local file="$1"

  # 优先取 Markdown 一级标题
  if [[ -f "$file" ]]; then
    local title
    title="$(grep -m 1 '^# ' "$file" 2>/dev/null | sed 's/^# *//' | sed 's/[[:space:]]*$//')"

    if [[ -n "$title" ]]; then
      echo "$title"
      return
    fi
  fi

  # 没有标题就用文件名
  basename "$file" .md
}

generate_md_commit_msg() {
  local total
  total="$(echo "$changed_files" | sed '/^$/d' | wc -l | tr -d ' ')"

  # 只有一个 md 文件时，提交信息更精确
  if [[ "$total" == "1" ]]; then
    local status file extra target title action

    IFS=$'\t' read -r status file extra <<< "$changed_files"
    target="${extra:-$file}"
    title="$(get_title_from_md "$target")"

    case "$status" in
      A)
        action="新增"
        ;;
      M)
        action="更新"
        ;;
      D)
        action="删除"
        ;;
      R*)
        action="重命名"
        ;;
      *)
        action="更新"
        ;;
    esac

    echo "docs: ${action}《${title}》"
    return
  fi

  # 多个 md 文件时，按主要操作生成
  local add_count modify_count delete_count
  add_count="$(echo "$changed_files" | awk '$1 == "A" {count++} END {print count+0}')"
  modify_count="$(echo "$changed_files" | awk '$1 == "M" {count++} END {print count+0}')"
  delete_count="$(echo "$changed_files" | awk '$1 == "D" {count++} END {print count+0}')"

  if (( add_count > 0 && modify_count == 0 && delete_count == 0 )); then
    echo "docs: 新增 ${add_count} 篇文章"
  elif (( modify_count > 0 && add_count == 0 && delete_count == 0 )); then
    echo "docs: 更新 ${modify_count} 篇文章"
  elif (( delete_count > 0 && add_count == 0 && modify_count == 0 )); then
    echo "docs: 删除 ${delete_count} 篇文章"
  else
    echo "docs: 更新博客文章"
  fi
}

generate_ai_commit_msg() {
  local stat files prompt

  stat="$(git diff --cached --stat)"
  files="$(git diff --cached --name-status | head -n 80)"

  prompt="$(cat <<EOF
根据下面的 Git staged 变更摘要，生成一行 Conventional Commit 提交信息。

要求：
- 只输出一行
- 不要解释
- 不要 Markdown
- 不要引号
- subject 使用中文
- 格式: type(scope): subject
- type 从 feat, fix, docs, style, refactor, perf, test, build, ci, chore 中选择

变更文件:
$files

变更统计:
$stat
EOF
)"

  case "$AI_CLI" in
    claude)
      echo "$prompt" | claude -p --output-format text
      ;;
    codex)
      echo "$prompt" | codex exec
      ;;
    *)
      echo "不支持的 AI_CLI: $AI_CLI，可选: claude / codex" >&2
      exit 1
      ;;
  esac
}

if [[ "$only_md" == "true" ]]; then
  msg="$(generate_md_commit_msg)"
else
  msg="$(generate_ai_commit_msg)"
fi

# 清洗输出
msg="$(
  echo "$msg" |
    head -n 1 |
    sed 's/^["'"'"']//; s/["'"'"']$//' |
    sed 's/^`//; s/`$//' |
    sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
)"

if [[ -z "$msg" ]]; then
  echo "提交信息为空，已取消"
  exit 1
fi

echo
echo "提交信息: $msg"
echo

read -r -p "确认提交并推送? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "已取消"
  exit 0
fi

git commit -m "$msg"
git push