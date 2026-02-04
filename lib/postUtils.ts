/** # 與 @ 開頭的 token 不計入字數（hashtag、mention） */
const EXCLUDED_PATTERN = /#\S+|@\S+/g;

/**
 * 計算發文有效字數（排除 #xxx 與 @xxx）
 */
export function getCountedLength(content: string): number {
  return content.replace(EXCLUDED_PATTERN, '').length;
}

const MAX_POST_LENGTH = 280;

/**
 * 將內容截斷至有效字數不超過 max（#/@ 不計）
 */
export function truncateToCounted(content: string, max: number = MAX_POST_LENGTH): string {
  if (getCountedLength(content) <= max) return content;
  let counted = 0;
  let i = 0;
  const re = new RegExp(EXCLUDED_PATTERN.source, 'g');
  while (i < content.length) {
    re.lastIndex = i;
    const m = re.exec(content);
    if (m && m.index === i) {
      i = re.lastIndex;
      continue;
    }
    counted += 1;
    if (counted > max) return content.slice(0, i);
    i += 1;
  }
  return content;
}

export { MAX_POST_LENGTH };
