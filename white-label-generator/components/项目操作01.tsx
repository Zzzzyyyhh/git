"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProjectActionsProps = {
  id: string;
  isArchived: boolean;
};

export function 项目操作01({ id, isArchived }: ProjectActionsProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<null | "copy" | "archive" | "delete">(null);

  async function runAction(action: "copy" | "archive" | "delete") {
    setBusyAction(action);

    try {
      if (action === "copy") {
        await fetch(`/api/labels/${id}/复制01`, { method: "POST" });
      } else if (action === "archive") {
        await fetch(`/api/labels/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: isArchived ? "draft" : "archived" })
        });
      } else {
        const shouldDelete = window.confirm("删除后不可恢复，确定删除这个标签项目吗？");
        if (!shouldDelete) {
          return;
        }
        await fetch(`/api/labels/${id}`, { method: "DELETE" });
      }

      router.refresh();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <button
        className="lp-btn-secondary px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={busyAction !== null}
        onClick={() => void runAction("copy")}
        type="button"
      >
        {busyAction === "copy" ? "复制中..." : "复制"}
      </button>
      <button
        className="lp-btn-secondary px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={busyAction !== null}
        onClick={() => void runAction("archive")}
        type="button"
      >
        {busyAction === "archive" ? "处理中..." : isArchived ? "取消归档" : "归档"}
      </button>
      <button
        className="lp-btn-danger px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={busyAction !== null}
        onClick={() => void runAction("delete")}
        type="button"
      >
        {busyAction === "delete" ? "删除中..." : "删除"}
      </button>
    </>
  );
}
