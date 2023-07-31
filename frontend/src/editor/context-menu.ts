import ContextMenu from "@imengyu/vue3-context-menu";
import { NodeEditor } from "rete";
import { Schemes } from "./types";
import { getRegisteredNodes } from "@/nodes";
import { EditorNode } from "./node";

export const createContextMenuMiddleware = (
  editor: NodeEditor<Schemes>,
  onCreate: (name: string) => void,
  onDelete: (name: string) => void
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (context: any) => {
    if (context.type !== "contextmenu") {
      return context;
    }

    const { event, context: contextName } = context.data as {
      event: PointerEvent;
      context: string | EditorNode;
    };
    event.preventDefault();
    event.stopPropagation();

    if (contextName === "root") {
      // Load registered nodes

      const nodes = getRegisteredNodes();
      const categories = new Set<string>();
      for (const node of nodes) {
        if (node.category) {
          categories.add(node.category);
        } else {
          categories.add("未分类");
        }
      }

      const items = Array.from(categories).map((category) => {
        return {
          label: category,
          children: [] as {
            label: string;
            onClick: () => void;
          }[],
        };
      });

      for (const node of nodes) {
        const category = node.category || "未分类";
        const item = items.find((item) => item.label === category);
        if (item) {
          item.children.push({
            label: node.label,
            onClick: () => {
              onCreate(node.name);
            },
          });
        }
      }

      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        theme: "dark",
        items,
      });
    } else if (contextName instanceof EditorNode) {
      const node = contextName as EditorNode;
      const items = [
        {
          label: "删除",
          onClick: () => {
            onDelete(node.id);
          },
        },
        {
          label: "克隆",
          onClick: () => {
            onCreate(node.name);
          },
        },
      ];
      ContextMenu.showContextMenu({
        x: event.x,
        y: event.y,
        theme: "dark",
        items,
      });
    }

    return context;
  };
};
