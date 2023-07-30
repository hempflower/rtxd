import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ClassicFlow, ConnectionPlugin } from "rete-connection-plugin";
import { VueRenderPlugin, Presets } from "rete-vue-render-plugin";
import { HistoryPlugin, HistoryActions } from "rete-history-plugin";
import { Presets as HistoryPresets } from "rete-history-plugin";
import { HistoryExtensions } from "rete-history-plugin";

import LabNodeVue from "./ui/LabNode.vue";
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

const createLabRenderPreset = () => {
  return Presets.classic.setup({
    customize: {
      node: () => {
        return LabNodeVue;
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

  // About connection:
  if (action === "create") {
    // Get socket type
    if (sourceSocket instanceof DataOutputSocket) {
      if (targetSocket instanceof DataInputSocket) {
        targetNode.connectToDataInterface(
          data.targetInput,
          data.sourceOutput,
          sourceNode
        );
      }
    }

    if (sourceSocket instanceof ActionOutputSocket) {
      if (targetSocket instanceof ActionInputSocket) {
        sourceNode.connectToActionInterface(
          data.targetInput,
          data.sourceOutput,
          targetNode
        );
      }
    }
  } else if (action === "remove") {
    if (sourceSocket instanceof DataOutputSocket) {
      if (targetSocket instanceof DataInputSocket) {
        targetNode.disconnectFromDataInterface(
          data.targetInput,
          data.sourceOutput,
          sourceNode
        );
      }
    }

    if (sourceSocket instanceof ActionOutputSocket) {
      if (targetSocket instanceof ActionInputSocket) {
        sourceNode.disconnectFromActionInterface(
          data.targetInput,
          data.sourceOutput,
          targetNode
        );
      }
    }
  }
};

export class LabEditor {
  private editor: NodeEditor<Schemes>;
  private area: AreaPlugin<Schemes, AreaExtra>;
  private connection: ConnectionPlugin<Schemes, AreaExtra>;
  private render: VueRenderPlugin<Schemes, AreaExtra>;
  private history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
  private nodes = getRegisteredNodes();
  private autoSerialize = ref(true);
  private running = ref(false);
  private lockContent = false;
  private content = "";
  private onContentChangeFn: (content: string) => void = () => null;

  constructor(container: HTMLElement) {
    this.editor = new NodeEditor<Schemes>();
    this.area = new AreaPlugin<Schemes, AreaExtra>(container);
    this.connection = new ConnectionPlugin<Schemes, AreaExtra>();
    this.render = new VueRenderPlugin<Schemes, AreaExtra>();
    this.history = new HistoryPlugin<Schemes, HistoryActions<Schemes>>();

    this.render.addPreset(createLabRenderPreset());
    this.connection.addPreset(createLabConnectionPreset(this.editor));

    this.editor.addPipe((context) => {
      if (["connectioncreated", "connectionremoved"].includes(context.type)) {
        updateConnectionMap(
          this.editor,
          // @ts-ignore
          context.data,
          context.type === "connectioncreated" ? "create" : "remove"
        );
        this.serializeJson();
      }
      return context;
    });

    this.area.addPipe((context) => {
      if (
        ["nodedragged", "noderemove", "nodecreate"].includes(context.type) &&
        this.autoSerialize.value
      ) {
        this.serializeJson();
      }
      return context;
    });

    this.area.addPipe(
      createContextMenuMiddleware(
        this.editor,
        async (name: string) => {
          this.addNode(name);
        },
        (nodeId) => {
          this.removeNode(nodeId);
        }
      )
    );

    this.editor.addPipe((context) => {
      if (context.type === "noderemove") {
        (context.data as EditorNode).destroy();
      }
      return context;
    });

    this.editor.use(this.area);
    this.area.use(this.connection);
    this.area.use(this.render);
    this.area.use(this.history);
    this.history.addPreset(HistoryPresets.classic.setup());
    HistoryExtensions.keyboard(this.history);
    AreaExtensions.simpleNodesOrder(this.area);
    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();
    AreaExtensions.selectableNodes(this.area, selector, {
      accumulating,
    });

    this.autoZoom();
  }

  public onContentChange(fn: (content: string) => void) {
    this.onContentChangeFn = fn;
  }

  public saveJson() {
    return this.content;
  }

  public async loadJson(newContent: string) {
    this.stop();
    await this.editor.clear();
    if (newContent === "") {
      return;
    }
    this.content = newContent;
    // Stop editor
    this.stop();

    const data = loadFromJson(this.content);

    // load nodes
    for (const node of data.nodes) {
      const config = this.nodes.find((n) => n.name === node.name);
      if (!config) {
        return;
      }
      const editorNode = new EditorNode(config, this.area);
      editorNode.id = node.id;
      editorNode.setData(node.data);
      await this.editor.addNode(editorNode);
      await this.area.translate(node.id, {
        x: node.position.x,
        y: node.position.y,
      });
    }

    // load connections
    for (const connection of data.connections) {
      const sourceNode = this.editor.getNode(connection.source.nodeId);
      const targetNode = this.editor.getNode(connection.target.nodeId);

      await this.editor.addConnection(
        new ClassicPreset.Connection(
          sourceNode,
          connection.source.socketId,
          targetNode,
          connection.target.socketId
        )
      );
    }

    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    this.lockContent = false;
  }

  private serializeJson() {
    const nodes = this.editor.getNodes() as EditorNode[];
    const connections = this.editor.getConnections();
    this.content = saveToJson({
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        position: this.area.nodeViews.get(node.id)?.position ?? { x: 0, y: 0 },
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
    this.onContentChangeFn(this.content);
  }

  public autoZoom() {
    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
  }

  public async addNode(name: string) {
    const config = this.nodes.find((node) => node.name === name);
    if (!config) {
      return;
    }
    const node = new EditorNode(config, this.area);
    await this.editor.addNode(node);

    this.area.translate(node.id, {
      x: this.area.area.pointer.x - 100,
      y: this.area.area.pointer.y - 32,
    });

    if (this.running.value) {
      node?.hooks.onStart?.();
    }

    return node;
  }

  public start() {
    const nodes = this.editor.getNodes() as EditorNode[];
    nodes.forEach((node) => node.hooks.onStart?.());
    this.running.value = true;
  }

  public stop() {
    const nodes = this.editor.getNodes() as EditorNode[];
    nodes.forEach((node) => node.hooks.onStop?.());
    this.running.value = false;
  }

  public destroy() {
    this.area.destroy();
  }

  public undo() {
    this.history.undo();
  }

  public redo() {
    this.history.redo();
  }

  public async removeNode(id: string) {
    const connections = this.editor
      .getConnections()
      .filter(
        (connection) => connection.source === id || connection.target === id
      );
    for (const connection of connections) {
      await this.editor.removeConnection(connection.id);
    }
    await this.editor.removeNode(id);
  }

  public async removeSelectedNodes() {
    const selectedNodes = this.editor
      .getNodes()
      .filter((node) => node.selected);
    for (const node of selectedNodes) {
      await this.removeNode(node.id);
    }
  }

  public cloneSelectedNodes() {
    const selectedNodes = this.editor
      .getNodes()
      .filter((node) => node.selected) as EditorNode[];
    selectedNodes.forEach((node) => {
      this.addNode(node.name);
    });
  }

  get isRunning() {
    return this.running;
  }

  get reteEditor() {
    return this.editor;
  }

  get reteArea() {
    return this.area;
  }
}
