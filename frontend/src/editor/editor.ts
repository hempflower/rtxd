import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ClassicFlow, ConnectionPlugin } from "rete-connection-plugin";
import { VueRenderPlugin, Presets } from "rete-vue-render-plugin";

import LabNode from "./ui/LabNode.vue";
import LabSocketAction from "./ui/LabSocketAction.vue";
import LabSocketData from "./ui/LabSocketData.vue";
import LabNodeBody from "./ui/LabNodeBody.vue";

import {
  DataInputSocket,
  DataOutputSocket,
  ActionInputSocket,
  ActionOutputSocket,
} from "./socket";

import { ref, watch } from "vue";
import type { Ref } from "vue";

import { getRegisteredNodes, ActionPayload } from "@/nodes";

import { EditorNode } from "./node";
import { loadFromJson, saveToJson } from "./loader";

import type { Schemes, AreaExtra } from "./types";
import { createContextMenuMiddleware } from "./context-menu";

export interface LabEditor {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  addNode: (name: string) => void;
  autoZoom: () => void;
  running: Ref<boolean>;
  editor: NodeEditor<Schemes>;
}

const createLabRenderPreset = () => {
  return Presets.classic.setup({
    customize: {
      node: () => {
        return LabNode;
      },
      socket: (data) => {
        if (
          data.payload instanceof DataInputSocket ||
          data.payload instanceof DataOutputSocket
        ) {
          return LabSocketData;
        }
        if (
          data.payload instanceof ActionInputSocket ||
          data.payload instanceof ActionOutputSocket
        ) {
          return LabSocketAction;
        }
        return LabSocketData;
      },
      control: () => {
        return LabNodeBody;
      },
    },
  });
};

const createLabConnectionPreset = (editor: NodeEditor<Schemes>) => {
  return () =>
    new ClassicFlow({
      canMakeConnection: (from, to) => {
        // Same side are not allowed
        if (from.side === to.side) {
          console.log("Same side connection");
          return false;
        }

        // Same node are not allowed
        if (from.nodeId === to.nodeId) {
          console.log("Same node connection");
          return false;
        }

        const inputNode =
          from.side === "input"
            ? editor.getNode(from.nodeId)
            : editor.getNode(to.nodeId);
        const outputNode =
          from.side === "output"
            ? editor.getNode(from.nodeId)
            : editor.getNode(to.nodeId);

        const fromKey = from.side === "input" ? from.key : to.key;
        const toKey = from.side === "output" ? from.key : to.key;

        if (!inputNode || !outputNode) {
          return false;
        }

        const inputSocket = inputNode.inputs[fromKey]?.socket;
        const outputSocket = outputNode.outputs[toKey]?.socket;

        if (!inputSocket || !outputSocket) {
          return false;
        }

        if (
          outputSocket instanceof DataOutputSocket &&
          inputSocket instanceof DataInputSocket
        ) {
          return inputSocket.canBeConnected(outputSocket);
        }

        if (
          inputSocket instanceof ActionInputSocket &&
          outputSocket instanceof ActionOutputSocket
        ) {
          return inputSocket.canBeConnected(outputSocket);
        }

        return false;
      },
    });
};

/**
 * When a connection is created or removed, update the connection map
 * @param editor Editor instance
 * @param data
 * @param action
 */
const updateConnectionMap = (
  editor: NodeEditor<Schemes>,
  data: {
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
  },
  action: "create" | "remove"
) => {
  const sourceNode = editor.getNode(data.source) as EditorNode;
  const targetNode = editor.getNode(data.target) as EditorNode;

  if (!sourceNode || !targetNode) {
    return;
  }

  const sourceSocket = sourceNode.outputs[data.sourceOutput]?.socket;
  const targetSocket = targetNode.inputs[data.targetInput]?.socket;

  if (action === "create") {
    // Get socket type
    if (sourceSocket instanceof DataOutputSocket) {
      if (targetSocket instanceof DataInputSocket) {
        targetNode.setInputDataFn(
          data.targetInput,
          () => sourceNode.dataOutputs.get(data.sourceOutput)?.() ?? null
        );
      }
    }

    if (sourceSocket instanceof ActionOutputSocket) {
      if (targetSocket instanceof ActionInputSocket) {
        sourceNode.setOutputActionFn(
          data.sourceOutput,
          `${targetNode.id}:${data.targetInput}`,
          (payload?: ActionPayload) =>
            targetNode.actionInputs.get(data.targetInput)?.(payload) ?? null
        );
      }
    }
  } else if (action === "remove") {
    if (sourceSocket instanceof DataOutputSocket) {
      if (targetSocket instanceof DataInputSocket) {
        targetNode.setInputDataFn(data.targetInput, null);
      }
    }

    if (sourceSocket instanceof ActionOutputSocket) {
      if (targetSocket instanceof ActionInputSocket) {
        sourceNode.removeOutputActionFn(
          data.sourceOutput,
          `${targetNode.id}:${data.targetInput}`
        );
      }
    }
  }
};

export const createEditor = async (
  container: HTMLElement,
  content: Ref<string>
): Promise<LabEditor> => {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VueRenderPlugin<Schemes, AreaExtra>();
  const running = ref(false);
  const nodes = getRegisteredNodes();
  const autoSerialize = ref(true);

  editor.addPipe((context) => {
    if (["connectioncreated", "connectionremoved"].includes(context.type)) {
      updateConnectionMap(
        editor,
        // @ts-ignore
        context.data,
        context.type === "connectioncreated" ? "create" : "remove"
      );
    }
    return context;
  });

  const start = () => {
    const nodes = editor.getNodes() as EditorNode[];
    nodes.forEach((node) => node.hooks.onStart?.());
    running.value = true;
  };

  const stop = () => {
    const nodes = editor.getNodes() as EditorNode[];
    nodes.forEach((node) => node.hooks.onStop?.());
    running.value = false;
  };
  let stopWatchContent = watch(content, () => deserializeJson());

  const deserializeJson = async () => {
    autoSerialize.value = false;
    stop();
    await editor.clear();
    if (content.value === "") {
      return;
    }

    const data = loadFromJson(content.value);

    // load nodes
    for (const node of data.nodes) {
      const config = nodes.find((n) => n.name === node.name);
      if (!config) {
        return;
      }
      const editorNode = new EditorNode(config, area);
      editorNode.id = node.id;
      editorNode.setData(node.data);
      await editor.addNode(editorNode);
      await area.translate(node.id, {
        x: node.position.x,
        y: node.position.y,
      });
    }

    // load connections
    for (const connection of data.connections) {
      const sourceNode = editor.getNode(connection.source.nodeId);
      const targetNode = editor.getNode(connection.target.nodeId);

      await editor.addConnection(
        new ClassicPreset.Connection(
          sourceNode,
          connection.source.socketId,
          targetNode,
          connection.target.socketId
        )
      );
    }

    AreaExtensions.zoomAt(area, editor.getNodes());
    autoSerialize.value = true;
  };

  const serializeJson = () => {
    const nodes = editor.getNodes() as EditorNode[];
    const connections = editor.getConnections();
    stopWatchContent();
    content.value = saveToJson({
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        position: area.nodeViews.get(node.id)?.position ?? { x: 0, y: 0 },
        data: node.getData(),
      })),
      connections: connections.map((connection) => ({
        source: {
          nodeId: connection.source,
          socketId: connection.sourceOutput,
        },
        target: {
          nodeId: connection.target,
          socketId: connection.targetInput,
        },
      })),
    });
    stopWatchContent = watch(content, () => deserializeJson());
  };

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(createLabRenderPreset());

  const addNode = async (name: string) => {
    const config = nodes.find((node) => node.name === name);
    if (!config) {
      return;
    }
    const node = new EditorNode(config, area);
    await editor.addNode(node);

    area.translate(node.id, {
      x: area.area.pointer.x - 100,
      y: area.area.pointer.y - 32,
    });

    return node;
  };

  const createNodeByName = (name: string) => {
    const config = nodes.find((node) => node.name === name);
    if (!config) {
      throw new Error(`Node ${name} not found`);
    }
    return new EditorNode(config, area);
  };


  render.addPreset(Presets.contextMenu.setup());

  connection.addPreset(createLabConnectionPreset(editor));

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);
  AreaExtensions.zoomAt(area, editor.getNodes());

  const autoZoom = () => {
    AreaExtensions.zoomAt(area, editor.getNodes());
  };

  area.addPipe((context) => {
    if (["nodedragged", "noderemoved", "nodecreate"].includes(context.type) && autoSerialize.value) {
      serializeJson();
    }
    return context;
  });

  area.addPipe(
    createContextMenuMiddleware(
      editor,
      async (name: string) => {
        const newNode = await addNode(name);

        // If editor is running, start it
        if (running.value) {
          newNode?.hooks.onStart?.();
        }

      },
      (nodeId) => {
        editor.removeNode(nodeId);
      }
    )
  );

  return {
    destroy: () => area.destroy(),
    start,
    stop,
    addNode,
    autoZoom,
    running,
    editor,
  };
};
