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

import {
  DataInputSocket,
  DataOutputSocket,
  ActionInputSocket,
  ActionOuputSocket,
} from "./socket";

import { ref } from "vue";
import type { Ref } from "vue";

import {
  getNodes,
  LabNode as LabNodeType,
  LabNodeHooks,
  LabNodeContext,
  ActionPayload,
} from "@/nodes";

export interface LabEditor {
  start: () => void;
  stop: () => void;
  destory: () => void;
  addNode: (name: string) => void;
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
        new ClassicPreset.Input(
          new ActionInputSocket(input.dataType),
          input.label
        )
      );
    } else {
      node.addInput(
        input.name,
        new ClassicPreset.Input(
          new DataInputSocket(input.dataType),
          input.label
        )
      );
    }
  }

  for (const output of config.outputs) {
    if (output.type === "action") {
      node.addOutput(
        output.name,
        new ClassicPreset.Output(
          new ActionOuputSocket(output.dataType ?? ""),
          output.label
        )
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
        if (
          data.payload instanceof ActionInputSocket ||
          data.payload instanceof ActionOuputSocket
        ) {
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
          inputSocket instanceof ActionInputSocket &&
          outputSocket instanceof ActionOuputSocket
        ) {
          return inputSocket.canBeConnected(outputSocket);
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
    actionConnectionMap: Map<
      PortId,
      Map<PortId, (data?: ActionPayload) => void>
    >;
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
        const data0 = hooks.onDataOutput?.(data.sourceOutput) ?? null;
        if (data0 === null) {
          return {
            data: null,
            type: null,
          };
        } else {
          // check data type
          const inputSocket = targetInputPort.socket as DataInputSocket;
          if (inputSocket.acceptsTypes.length === 0) {
            return data0;
          }
          if (
            data0.type !== null &&
            inputSocket.acceptsTypes.includes(data0.type)
          ) {
            return data0;
          }

          return {
            data: null,
            type: null,
          };
        }
      });
    } else {
      connectionMaps.dataConnectionMap.delete(portId);
    }
  } else if (
    sourceOutputPort.socket instanceof ActionOuputSocket &&
    targetInputPort.socket instanceof ActionInputSocket
  ) {
    const portId = createPortId(data.source, data.sourceOutput);
    if (action === "create") {
      const hooks = hooksMap.get(data.target);
      if (!hooks) {
        return;
      }
      const actionHooks =
        connectionMaps.actionConnectionMap.get(portId) ??
        new Map<PortId, (data?: ActionPayload) => void>();
      actionHooks.set(
        createPortId(data.target, data.targetInput),
        (payload?: ActionPayload) => {
          // type check
          const inputSocket = targetInputPort.socket as ActionInputSocket;
          if (inputSocket.acceptsTypes.length === 0) {
            // no type check
            hooks.onAction?.(data.targetInput, payload);
          } else {
            // type check
            if (
              payload?.type &&
              inputSocket.acceptsTypes.includes(payload?.type)
            ) {
              hooks.onAction?.(data.targetInput, payload);
            }
          }
        }
      );
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
  const actionConnectionMap = new Map<
    PortId,
    Map<PortId, (data?: ActionPayload) => void>
  >();

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
        // check data type
        const input = node.inputs[name];
        if (!input) {
          return {
            data: null,
            type: null,
          };
        }

        const data = dataConnectionMap.get(createPortId(node.id, name))?.() ?? {
          data: null,
          type: null,
        };

        if (data === null) {
          return {
            data: null,
            type: null,
          };
        }

        return data;
      },
      invokeAction: (name: string, data?: ActionPayload) => {
        const actionHooks = actionConnectionMap.get(
          createPortId(node.id, name)
        );
        if (!actionHooks) {
          return;
        }

        actionHooks.forEach((hook) => {
          hook(data);
        });
      },
      updateNode: () => {
        // Update connection
        area.update('node', node.id)

      }
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

  // Add nodes
  let loc_offset = 0;
  nodes.forEach(async (node) => {
    const { node: node0, hooks } = createNodeFromConfig(node, (node) =>
      createNodeContext(node)
    );
    hooksMap.set(node0.id, hooks);
    await editor.addNode(node0);

    area.translate(node0.id, {
      x: loc_offset,
      y: 0,
    });
    loc_offset += 240;
  });

  const addNode = async (name: string) => {
    const node = nodes.find((node) => node.name === name);
    if (!node) {
      return;
    }
    const { node: node0, hooks } = createNodeFromConfig(node, (node) =>
      createNodeContext(node)
    );
    hooksMap.set(node0.id, hooks);
    await editor.addNode(node0);
  };

  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destory: () => area.destroy(),
    start,
    stop,
    addNode,
    running,
    editor,
    autoZoom: () => AreaExtensions.zoomAt(area, editor.getNodes()),
  };
};
