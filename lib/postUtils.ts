/** # 與 @ 開頭的 token 不計入字數（hashtag、mention） */
const EXCLUDED_PATTERN = /#\S+|@\S+/g;

/** 僅辨識 http/https 連結；用於字數計算與截斷 */
const URL_PATTERN = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

/**
 * 計算發文有效字數（排除 #xxx 與 @xxx）
 * 另外：網址長度若大於 23，字數一律只扣 23
 */
export function getCountedLength(content: string): number {
  if (!content) return 0;

  let counted = 0;
  const urlParts = content.split(URL_PATTERN);

  for (let i = 0; i < urlParts.length; i++) {
    const part = urlParts[i];
    // URL 片段：以 http/https 開頭
    if (part.match(/^https?:\/\//)) {
      const urlLen = part.length;
      counted += urlLen > 23 ? 23 : urlLen;
      continue;
    }
    // 非 URL 片段：排除 hashtag / mention 後計算長度
    counted += part.replace(EXCLUDED_PATTERN, '').length;
  }

  return counted;
}

const MAX_POST_LENGTH = 280;

/**
 * 將內容截斷至有效字數不超過 max
 * - #/@ token 不計入
 * - 單一網址長度超過 23 時，整個網址一律視為 23 字
 *   （若加入整個網址會超過上限，就整段網址不納入）
 */
export function truncateToCounted(content: string, max: number = MAX_POST_LENGTH): string {
  if (getCountedLength(content) <= max) return content;
  let counted = 0;
  let i = 0;
  const excludedRe = new RegExp(EXCLUDED_PATTERN.source, 'g');
  const urlRe = new RegExp(URL_PATTERN.source, 'g');

  while (i < content.length) {
    // 先檢查是否從此位置開始是一個 URL
    urlRe.lastIndex = i;
    const urlMatch = urlRe.exec(content);
    if (urlMatch && urlMatch.index === i) {
      const urlText = urlMatch[0];
      const urlCost = urlText.length > 23 ? 23 : urlText.length;
      if (counted + urlCost > max) {
        // 加入整個網址會超過上限，就直接截斷在網址開始前
        return content.slice(0, i);
      }
      counted += urlCost;
      i = urlRe.lastIndex;
      continue;
    }

    // 再檢查是否是 #/@ token
    excludedRe.lastIndex = i;
    const exMatch = excludedRe.exec(content);
    if (exMatch && exMatch.index === i) {
      // hashtag / mention 完整保留但不計字數
      i = excludedRe.lastIndex;
      continue;
    }

    // 一般字元：逐字計數
    counted += 1;
    if (counted > max) return content.slice(0, i);
    i += 1;
  }

  return content;
}

export { MAX_POST_LENGTH };
