import { ClassicPreset, GetSchemes } from "rete";
import type { ActionFn, DataFn, DataPayload, ActionPayload } from "./types";
import type { LabNode, LabNodeHooks } from "@/nodes";
import { AreaPlugin } from "rete-area-plugin";
import { VueArea2D } from "rete-vue-render-plugin";

import {
  DataInputSocket,
  DataOutputSocket,
  ActionInputSocket,
  ActionOutputSocket,
} from "./socket";
import type { Schemes, AreaExtra } from "./types";

class CustomControl extends ClassicPreset.Control {
  constructor(
    public onWillMount: (el: HTMLElement) => void,
    public onWillUnmount?: () => void
  ) {
    super();
  }
}

export class EditorNode extends ClassicPreset.Node {
  public readonly name: string;

  private dataInputs = new Map<string, DataFn>();
  public readonly dataOutputs = new Map<string, DataFn>();

  public readonly actionInputs = new Map<string, ActionFn>();
  private actionOutputs = new Map<string, Map<string, ActionFn>>();

  public readonly hooks: LabNodeHooks;

  private area: AreaPlugin<Schemes, AreaExtra>;

  private data = "";
  private config: LabNode;

  constructor(
    config: LabNode,
    area: AreaPlugin<Schemes, AreaExtra>,
    data?: string
  ) {
    super(config.label);
    this.name = config.name;
    this.area = area;
    this.config = config;
    this.data = data ?? "";

    this.hooks = config.hooks({
      readInput: (name: string) => this.readInput(name),
      invokeAction: (name: string, data?: ActionPayload) =>
        this.invokeAction(name, data),
      updateNode: () => this.updateNodeStatus(),
      loadData: () => this.data,
      saveData: (data: string) => {
        this.data = data;
      },
    });

    this.config.outputs
      .filter((v) => v.type === "data")
      .forEach((output) => {
        this.dataOutputs.set(output.name, () => {
          return this.hooks.onDataOutput?.(output.name) ?? null;
        });
      });
    this.config.outputs
      .filter((v) => v.type === "action")
      .forEach((output) => {
        this.actionOutputs.set(output.name, new Map());
      });

    this.config.inputs
      .filter((v) => v.type === "action")
      .forEach((input) => {
        this.actionInputs.set(input.name, (data?: ActionPayload) => {
          return this.hooks.onAction?.(input.name, data) ?? null;
        });
      });
    this.addHTMLElementBody();
    this.addSockets();

    this.hooks.onCreated?.();
  }

  private addHTMLElementBody() {
    this.addControl(
      "body",
      new CustomControl(
        (el) => {
          this.hooks.onMount(el);
        },
        () => {
          console.log("unmount");
          this.hooks.onStop?.()
          this.hooks.onDestroy?.();
          this.hooks.onUnmount();
        }
      )
    );
  }
  private addSockets() {
    this.config.inputs.forEach((input) => {
      if (input.type === "action") {
        this.addInput(
          input.name,
          new ClassicPreset.Input(
            new ActionInputSocket(input.dataType),
            input.label
          )
        );
      } else {
        this.addInput(
          input.name,
          new ClassicPreset.Input(
            new DataInputSocket(input.dataType),
            input.label
          )
        );
      }
    });

    this.config.outputs.forEach((output) => {
      if (output.type === "action") {
        this.addOutput(
          output.name,
          new ClassicPreset.Output(
            new ActionOutputSocket(output.dataType ?? ""),
            output.label
          )
        );
      } else {
        this.addOutput(
          output.name,
          new ClassicPreset.Output(
            new DataOutputSocket(output.dataType),
            output.label
          )
        );
      }
    });
  }

  public readInput(name: string) {
    const input = this.dataInputs.get(name);
    return input?.() ?? null;
  }

  public invokeAction(name: string, data?: ActionPayload) {
    const action = this.actionOutputs.get(name);
    action?.forEach((v) => {
      v(data);
    });
  }

  public updateNodeStatus() {
    this.area.update("node", this.id);
  }

  public setInputDataFn(name: string, data?: DataFn | null) {
    if (!data) {
      this.dataInputs.delete(name);
      return;
    }
    this.dataInputs.set(name, data);
  }

  public setData(data: string) {
    this.data = data;
  }

  public getData() {
    return this.data;
  }

  public setOutputActionFn(name: string, id: string, action?: ActionFn | null) {
    if (!action) {
      this.actionOutputs.delete(name);
      return;
    }
    this.actionOutputs.get(name)?.set(id, action);
  }

  public removeOutputActionFn(name: string, id: string) {
    this.actionOutputs.get(name)?.delete(id);
  }
}
