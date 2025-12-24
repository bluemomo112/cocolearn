#!/bin/bash

# 批量替换绿色主题为蓝色主题的脚本
# 使用方法: bash scripts/update-colors.sh

echo "开始更新颜色主题..."

# 查找所有 tsx 和 ts 文件（排除 node_modules 和 .next）
find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" | while read file; do
  echo "处理: $file"

  # 替换 emerald -> blue
  sed -i '' 's/emerald-50/blue-50/g' "$file"
  sed -i '' 's/emerald-100/blue-100/g' "$file"
  sed -i '' 's/emerald-200/blue-200/g' "$file"
  sed -i '' 's/emerald-300/blue-300/g' "$file"
  sed -i '' 's/emerald-400/blue-400/g' "$file"
  sed -i '' 's/emerald-500/blue-500/g' "$file"
  sed -i '' 's/emerald-600/blue-600/g' "$file"
  sed -i '' 's/emerald-700/blue-700/g' "$file"
  sed -i '' 's/emerald-800/blue-800/g' "$file"
  sed -i '' 's/emerald-900/blue-900/g' "$file"

  # 替换 teal -> sky
  sed -i '' 's/teal-50/sky-50/g' "$file"
  sed -i '' 's/teal-100/sky-100/g' "$file"
  sed -i '' 's/teal-200/sky-200/g' "$file"
  sed -i '' 's/teal-300/sky-300/g' "$file"
  sed -i '' 's/teal-400/sky-400/g' "$file"
  sed -i '' 's/teal-500/sky-500/g' "$file"
  sed -i '' 's/teal-600/sky-600/g' "$file"
  sed -i '' 's/teal-700/sky-700/g' "$file"
  sed -i '' 's/teal-800/sky-800/g' "$file"
  sed -i '' 's/teal-900/sky-900/g' "$file"

  # 替换颜色字符串（如 'emerald' -> 'blue'）
  sed -i '' "s/'emerald'/'blue'/g" "$file"
  sed -i '' 's/"emerald"/"blue"/g' "$file"
done

echo "颜色主题更新完成！"
