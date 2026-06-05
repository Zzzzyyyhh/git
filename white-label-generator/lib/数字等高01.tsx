import type { ReactNode } from "react";

type 等高字符选项 = {
  fixedHeightMm?: number;
  includeLatin?: boolean;
  includeCjk?: boolean;
};

function getEqualPatterns(includeLatin: boolean, includeCjk: boolean) {
  const segments = ["[0-9０-９]+"];
  if (includeLatin) {
    segments.push("[A-Za-z]+");
  }
  if (includeCjk) {
    segments.push("[\\u3400-\\u4DBF\\u4E00-\\u9FFF]");
  }

  const source = `(${segments.join("|")})`;

  return {
    splitPattern: new RegExp(source, "g"),
    exactPattern: new RegExp(`^(?:${segments.join("|")})$`)
  };
}

function getEqualCharacterStyle(options: 等高字符选项) {
  if (options.fixedHeightMm) {
    const fixedHeight = `${options.fixedHeightMm}mm`;
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: fixedHeight,
      fontSize: fixedHeight,
      lineHeight: fixedHeight,
      verticalAlign: "baseline"
    } as const;
  }

  return {
    display: "inline-block",
    fontSize: "1.08em",
    lineHeight: 1,
    transform: "translateY(0.02em)",
    transformOrigin: "50% 60%"
  } as const;
}

export function 渲染数字等高01(text: string, options: 等高字符选项 = {}): ReactNode {
  if (!text) {
    return text;
  }

  const patterns = getEqualPatterns(Boolean(options.includeLatin), Boolean(options.includeCjk));
  const equalCharacterStyle = getEqualCharacterStyle(options);

  return text.split(patterns.splitPattern).map((part, index) => {
    if (!part) {
      return null;
    }

    return patterns.exactPattern.test(part) ? (
      <span key={`${part}-${index}`} style={equalCharacterStyle}>
        {part}
      </span>
    ) : (
      part
    );
  });
}

export function 输出数字等高01(text: string, escapeHtml: (value: string) => string, options: 等高字符选项 = {}) {
  if (!text) {
    return "";
  }

  const patterns = getEqualPatterns(Boolean(options.includeLatin), Boolean(options.includeCjk));
  const style = options.fixedHeightMm
    ? `display:inline-flex;align-items:center;justify-content:center;height:${options.fixedHeightMm}mm;font-size:${options.fixedHeightMm}mm;line-height:${options.fixedHeightMm}mm;vertical-align:baseline;`
    : "display:inline-block;font-size:1.08em;line-height:1;transform:translateY(0.02em);transform-origin:50% 60%;";

  return text
    .split(patterns.splitPattern)
    .map((part) =>
      patterns.exactPattern.test(part)
        ? `<span style="${style}">${escapeHtml(part)}</span>`
        : escapeHtml(part)
    )
    .join("");
}
