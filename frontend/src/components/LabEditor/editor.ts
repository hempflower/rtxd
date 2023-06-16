import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ClassicFlow,
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { VueRenderPlugin, Presets, VueArea2D } from "rete-vue-render-plugin";

import LabNode from "./ui/LabNode.vue";
import LabSocketAction from "./ui/LabSocketAction.vue";
import LabSocketData from "./ui/LabSocketData.vue";
import LabNodeBody from "./ui/LabNodeBody.vue";

import { DataInputSocket, DataOutputSocket, ActionSocket } from "./socket";

import { ref } from "vue";
import type { Ref } from "vue";

import {
  getNodes,
  LabNode as LabNodeType,
  LabNodeHooks,
  LabNodeContext,
} from "@/nodes";
import nodeCounter from "@/nodes/lab-nodes/node-counter";

export interface LabEditor {
  start: () => void;
  stop: () => void;
  destory: () => void;
  running: Ref<boolean>;
  editor: NodeEditor<Schemes>;
  autoZoom: () => void;
}

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = VueArea2D<Schemes>;

class CustomControl extends ClassicPreset.Control {
  constructor(
    public onWillMount: (el: HTMLElement) => void,
    public onWillUnmount?: () => void
  ) {
    super();
  }
}

const createNodeFromConfig = (
  config: LabNodeType,
  context: (node: ClassicPreset.Node) => LabNodeContext
) => {
  const node = new ClassicPreset.Node(config.label);

  const hooks = config.hooks(context(node));
  node.addControl(
    "body",
    new CustomControl(
      (el) => {
        hooks.onMount(el);
      },
      () => {
        hooks.onUnmount();
      }
    )
  );

  for (const input of config.inputs) {
    if (input.type === "action") {
      node.addInput(
        input.name,
        new ClassicPreset.Input(new ActionSocket(), input.label)
      );
    } else {
      node.addInput(
        input.name,
        new ClassicPreset.Input(new DataInputSocket(input.type), input.label)
      );
    }
  }

  for (const output of config.outputs) {
    if (output.type === "action") {
      node.addOutput(
        output.name,
        new ClassicPreset.Output(new ActionSocket(), output.label)
      );
    } else {
      node.addOutput(
        output.name,
        new ClassicPreset.Output(
          new DataOutputSocket(output.type),
          output.label
        )
      );
    }
  }

  hooks.onCreate?.();

  return {
    node,
    hooks,
  };
};

const createLabRenderPreset = () => {
  return Presets.classic.setup({
    customize: {
      node: (data) => {
        return LabNode;
      },
      socket: (data) => {
        if (
          data.payload instanceof DataInputSocket ||
          data.payload instanceof DataOutputSocket
        ) {
          return LabSocketData;
        }
        if (data.payload instanceof ActionSocket) {
          return LabSocketAction;
        }
        return LabSocketData;
      },
      control: (data) => {
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
          inputSocket instanceof ActionSocket &&
          outputSocket instanceof ActionSocket
        ) {
          return true;
        }

        return false;
      },
    });
};

type PortId = string;
const createPortId = (nodeId: string, port: string) => `${nodeId}:${port}`;
/**
 * Core engine for running nodes
 * @param editor
 * @param connectionMaps
 * @param hooksMap
 * @param data
 * @param action
 */
const updateConnectionMap = (
  editor: NodeEditor<Schemes>,
  connectionMaps: {
    dataConnectionMap: Map<
      string,
      () => { data: unknown; type: string } | { data: null; type: null }
    >;
    actionConnectionMap: Map<PortId, Map<PortId, () => void>>;
  },
  hooksMap: Map<string, LabNodeHooks>,
  data: {
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
  },
  action: "create" | "remove"
) => {
  const sourceNode = editor.getNode(data.source);
  const targetNode = editor.getNode(data.target);

  if (!sourceNode || !targetNode) {
    return;
  }

  const sourceOutputPort = sourceNode.outputs[data.sourceOutput];
  const targetInputPort = targetNode.inputs[data.targetInput];

  if (!sourceOutputPort || !targetInputPort) {
    return;
  }

  if (
    sourceOutputPort.socket instanceof DataOutputSocket &&
    targetInputPort.socket instanceof DataInputSocket
  ) {
    const portId = createPortId(data.target, data.targetInput);
    if (action === "create") {
      const hooks = hooksMap.get(data.source);
      if (!hooks) {
        return;
      }
      connectionMaps.dataConnectionMap.set(portId, () => {
        const dataType = (sourceOutputPort.socket as DataOutputSocket).dataType;
        const data0 = hooks.onDataOutput?.(data.sourceOutput) ?? null;
        if (data0 === null) {
          return {
            data: null,
            type: null,
          };
        } else {
          return {
            data: data0,
            type: dataType,
          };
        }
      });
    } else {
      connectionMaps.dataConnectionMap.delete(portId);
    }
  } else if (
    sourceOutputPort.socket instanceof ActionSocket &&
    targetInputPort.socket instanceof ActionSocket
  ) {
    const portId = createPortId(data.source, data.sourceOutput);
    if (action === "create") {
      const hooks = hooksMap.get(data.target);
      if (!hooks) {
        return;
      }
      const actionHooks =
        connectionMaps.actionConnectionMap.get(portId) ?? new Map();
      actionHooks.set(createPortId(data.target, data.targetInput), () => {
        hooks.onAction?.(data.targetInput);
      });
      connectionMaps.actionConnectionMap.set(portId, actionHooks);
    } else {
      const actionHooks = connectionMaps.actionConnectionMap.get(portId);
      if (!actionHooks) {
        return;
      }
      actionHooks.delete(createPortId(data.target, data.targetInput));
      if (actionHooks.size === 0) {
        connectionMaps.actionConnectionMap.delete(portId);
      }
    }
  }
};

export const createEditor = async (
  container: HTMLElement
): Promise<LabEditor> => {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new VueRenderPlugin<Schemes, AreaExtra>();
  const running = ref(false);

  const nodes = getNodes();
  const hooksMap: Map<string, LabNodeHooks> = new Map();

  // Connection Manager
  // Key as target input, value as source output
  const dataConnectionMap = new Map<
    string,
    () => { data: unknown; type: string } | { data: null; type: null }
  >();
  const actionConnectionMap = new Map<PortId, Map<PortId, () => void>>();

  editor.addPipe((context) => {
    if (["connectioncreated", "connectionremoved"].includes(context.type)) {
      updateConnectionMap(
        editor,
        {
          dataConnectionMap,
          actionConnectionMap,
        },
        hooksMap,
        // @ts-ignore
        context.data,
        context.type === "connectioncreated" ? "create" : "remove"
      );
    }
    return context;
  });

  const createNodeContext = (node: ClassicPreset.Node): LabNodeContext => {
    return {
      readInput: (name: string) => {
        return (
          dataConnectionMap.get(createPortId(node.id, name))?.() ?? {
            data: null,
            type: null,
          }
        );
      },
      invokeAction: (name: string) => {
        const actionHooks = actionConnectionMap.get(
          createPortId(node.id, name)
        );
        if (!actionHooks) {
          return;
        }
        actionHooks.forEach((hook) => {
          hook();
        });
      },
    };
  };

  const start = () => {
    hooksMap.forEach((hooks) => {
      hooks.onStart?.();
    });

    running.value = true;
  };

  const stop = () => {
    hooksMap.forEach((hooks) => {
      hooks.onStop?.();
    });

    running.value = false;
  };

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(createLabRenderPreset());

  connection.addPreset(createLabConnectionPreset(editor));

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  // Add first node
  const { node: node1, hooks: hooks1 } = createNodeFromConfig(
    nodes[1],
    (node) => createNodeContext(node)
  );
  const { node: node2, hooks: hooks2 } = createNodeFromConfig(
    nodes[1],
    (node) => createNodeContext(node)
  );
  const { node: node3, hooks: hooks3 } = createNodeFromConfig(
    nodes[2],
    (node) => createNodeContext(node)
  );
  const { node: node4, hooks: hooks4 } = createNodeFromConfig(
    nodes[3],
    (node) => createNodeContext(node)
  );
  const { node: node5, hooks: hooks5 } = createNodeFromConfig(
    nodes[4],
    (node) => createNodeContext(node)
  );

  hooksMap.set(node1.id, hooks1);
  hooksMap.set(node2.id, hooks2);
  hooksMap.set(node3.id, hooks3);
  hooksMap.set(node4.id, hooks4);
  hooksMap.set(node5.id, hooks5);

  await editor.addNode(node1);
  await editor.addNode(node2);
  await editor.addNode(node3);
  await editor.addNode(node4);
  await editor.addNode(node5);

  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destory: () => area.destroy(),
    start,
    stop,
    running,
    editor,
    autoZoom: () => AreaExtensions.zoomAt(area, editor.getNodes()),
  };
};
