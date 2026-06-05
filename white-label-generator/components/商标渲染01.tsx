"use client";

import type { CSSProperties } from "react";

import type { LabelData, LogoBox, LogoKind } from "@/lib/labelSchema";
import type { TemplateKey } from "@/lib/templateCatalog";

const logoAssetMap: Record<Exclude<LogoKind, "none" | "custom">, string> = {
  image: "/商标01.png",
  text: "/商标02.jpg"
};

function logoStyle(box: LogoBox): CSSProperties {
  return {
    position: "absolute",
    left: `${box.x}mm`,
    top: `${box.y}mm`,
    width: `${box.width}mm`,
    height: `${box.height}mm`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "none"
  };
}

export function 商标渲染01({
  data,
  templateKey
}: {
  data: LabelData;
  templateKey: TemplateKey;
}) {
  if (data.logoKind === "none") {
    return null;
  }

  const src = data.logoKind === "custom" ? data.customLogoPng : logoAssetMap[data.logoKind];
  if (!src) {
    return null;
  }

  const box = data.logoBoxes[templateKey];

  return (
    <div aria-hidden="true" style={logoStyle(box)}>
      <img
        alt=""
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block"
        }}
      />
    </div>
  );
}
