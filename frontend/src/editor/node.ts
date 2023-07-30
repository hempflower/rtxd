import { ClassicPreset } from "rete";
import type { ActionFn, DataFn } from "./types";
import type {
  LabNode,
  LabNodeHooks,
  LabNodeContext,
  ActionPayload,
  LabNodeActionInputInterface,
  LabNodeActionOutputInterface,
  LabNodeDataInputInterface,
  LabNodeDataOutputInterface,
  LabNodeInterface,
} from "@/nodes";
import { AreaPlugin } from "rete-area-plugin";

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

class NodeContextImpl implements LabNodeContext {
  private node: EditorNode;
  private area: AreaPlugin<Schemes, AreaExtra>;

  constructor(node: EditorNode, area: AreaPlugin<Schemes, AreaExtra>) {
    this.node = node;
    this.area = area;
  }

  readInput(name: string): { data: unknown; type: string } | null {
    return this.node.dataInputInterfaces.get(name)?.readData() ?? null;
  }
  invokeAction(name: string, data?: ActionPayload | undefined): void {
    return this.node.actionOutputInterfaces.get(name)?.invokeAction(data);
  }
  updateNode(): void {
    return this.node.updateNodeStatus();
  }
  loadData(): string {
    return this.node.getData();
  }
  saveData(data: string): void {
    return this.node.setData(data);
  }
  addDataInput(
    name: string,
    label: string,
    acceptTypes: []
  ): LabNodeDataInputInterface {
    const input = new LabNodeDataInputInterfaceImpl(
      name,
      acceptTypes,
      () => null
    );
    this.node.dataInputInterfaces.set(name, input);
    this.node.addInput(
      name,
      new ClassicPreset.Input(new DataInputSocket(acceptTypes), label)
    );

    return input;
  }
  addActionInput(
    name: string,
    label: string,
    acceptTypes: []
  ): LabNodeActionInputInterface {
    const input = new LabNodeActionInputInterfaceImpl(
      name,
      acceptTypes,
      () => null
    );
    this.node.actionInputInterfaces.set(name, input);
    this.node.addInput(
      name,
      new ClassicPreset.Input(new ActionInputSocket(acceptTypes), label, true)
    );

    return input;
  }
  addDataOutput(
    name: string,
    label: string,
    dataType: string
  ): LabNodeDataOutputInterface {
    const output = new LabNodeDataOutputInterfaceImpl(
      name,
      dataType,
      () => null
    );
    this.node.dataOutputInterfaces.set(name, output);
    this.node.addOutput(
      name,
      new ClassicPreset.Output(new DataOutputSocket(dataType), label)
    );

    return output;
  }
  addActionOutput(
    name: string,
    label: string,
    dataType: string
  ): LabNodeActionOutputInterface {
    const output = new LabNodeActionOutputInterfaceImpl(
      name,
      dataType,
      () => null
    );
    this.node.actionOutputInterfaces.set(name, output);
    this.node.addOutput(
      name,
      new ClassicPreset.Output(new ActionOutputSocket(dataType), label)
    );

    return output;
  }
  removeInput(name: string): void {
    this.node.removeInput(name);
  }
  removeOutput(name: string): void {
    this.node.removeOutput(name);
  }
}

class LabNodeInterfaceImpl implements LabNodeInterface {
  name: string;
  isConnected: boolean;

  onConnectedFn: () => void = () => 0;
  onDisconnectedFn: () => void = () => 0;
  constructor(name: string) {
    this.isConnected = false;
    this.name = name;
  }
  public onConnected(fn: () => void) {
    this.onConnectedFn = fn;
  }

  public onDisconnected(fn: () => void) {
    this.onDisconnectedFn = fn;
  }
}

class LabNodeActionInputInterfaceImpl
  extends LabNodeInterfaceImpl
  implements LabNodeActionInputInterface
{
  acceptTypes: string[];
  actionFn: ActionFn;

  constructor(name: string, acceptTypes: string[], onAction: ActionFn) {
    super(name);
    this.acceptTypes = acceptTypes;
    this.actionFn = onAction;
  }

  public onAction(fn : (data?: ActionPayload) => void) {
    this.actionFn = fn;
  }

}

class LabNodeActionOutputInterfaceImpl
  extends LabNodeInterfaceImpl
  implements LabNodeActionOutputInterface
{
  dataType: string;
  invokeAction: ActionFn;

  constructor(name: string, dataType: string, invokeAction: ActionFn) {
    super(name);
    this.dataType = dataType;
    this.invokeAction = invokeAction;
  }
}

class LabNodeDataInputInterfaceImpl
  extends LabNodeInterfaceImpl
  implements LabNodeDataInputInterface
{
  acceptTypes: string[];
  readData: DataFn;

  constructor(name: string, acceptTypes: string[], readData: DataFn) {
    super(name);
    this.acceptTypes = acceptTypes;
    this.readData = readData;
  }
}

class LabNodeDataOutputInterfaceImpl
  extends LabNodeInterfaceImpl
  implements LabNodeDataOutputInterface
{
  dataType: string;
  outputDataFn: DataFn;

  constructor(name: string, dataType: string, onOutputData: DataFn) {
    super(name);
    this.dataType = dataType;
    this.outputDataFn = onOutputData;
  }

  public onOutputData(fn: () => { data: unknown; type: string } | null) {
    this.outputDataFn = fn;
  }

}

export class EditorNode extends ClassicPreset.Node {
  public readonly name: string;

  public readonly dataInputInterfaces = new Map<
    string,
    LabNodeDataInputInterfaceImpl
  >();
  public readonly dataOutputInterfaces = new Map<
    string,
    LabNodeDataOutputInterfaceImpl
  >();

  public readonly actionInputInterfaces = new Map<
    string,
    LabNodeActionInputInterfaceImpl
  >();
  public readonly actionOutputInterfaces = new Map<
    string,
    LabNodeActionOutputInterfaceImpl
  >();

  public hooks: LabNodeHooks;

  private area: AreaPlugin<Schemes, AreaExtra>;

  private data = "";
  private config: LabNode;
  private nodeContext: LabNodeContext;

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
    this.nodeContext = new NodeContextImpl(this, this.area);
    this.hooks = this.config.hooks(this.nodeContext);

    this.addHTMLElementBody();
  }

  private addHTMLElementBody() {
    this.addControl(
      "body",
      new CustomControl(
        (el) => {
          this.hooks.onMount(el);
        },
        () => {
          this.hooks.onStop?.();
          this.hooks.onUnmount();
        }
      )
    );
  }

  public connectToDataInterface(
    inputInterface: string,
    outputInterface: string,
    targetNode: EditorNode,

  ) {
    const input = this.dataInputInterfaces.get(inputInterface);
    const output = targetNode.dataOutputInterfaces.get(outputInterface);
    if (input && output) {
      input.readData = () => output.outputDataFn();
      input.isConnected = true;
      output.isConnected = true;
      input.onConnectedFn();
      output.onConnectedFn();
    }
  }

  public disconnectFromDataInterface(
    inputInterface: string,
    outputInterface: string,
    targetNode: EditorNode
  ) {
    const input = this.dataInputInterfaces.get(inputInterface);
    const output = targetNode.dataOutputInterfaces.get(outputInterface);

    if (input && output) {
      input.readData = () => null;
      input.isConnected = false;
      output.isConnected = false;
      input.onDisconnectedFn();
      output.onDisconnectedFn();
    }
  }

  public connectToActionInterface(
    inputInterface: string,
    outputInterface: string,
    targetNode: EditorNode,
  ) {
    const input = targetNode.actionInputInterfaces.get(inputInterface);
    const output = this.actionOutputInterfaces.get(outputInterface);
    if (input && output) {
      output.invokeAction = (data) => input.actionFn(data);
      input.isConnected = true;
      output.isConnected = true;
      input.onConnectedFn();
      output.onConnectedFn();
    }
  }

  public disconnectFromActionInterface(
    inputInterface: string,
    outputInterface: string,
    targetNode: EditorNode,
  ) {
    const input = targetNode.actionInputInterfaces.get(inputInterface);
    const output = this.actionOutputInterfaces.get(outputInterface);
    if (input && output) {
      output.invokeAction = () => null;
      input.isConnected = false;
      output.isConnected = false;
      input.onDisconnectedFn();
      output.onDisconnectedFn();
    }
  }

  public readOutputData(name: string): { data: unknown; type: string } | null {
    const output = this.dataOutputInterfaces.get(name);
    return output?.outputDataFn() ?? null;
  }

  public invokeInputAction(name: string, data?: ActionPayload) {
    const action = this.actionInputInterfaces.get(name);
    action?.actionFn(data);
  }

  public updateNodeStatus() {
    this.area.update("node", this.id);
  }

  public setData(data: string) {
    this.data = data;
  }

  public getData() {
    return this.data;
  }

  public destroy() {
    this.hooks.onUnmount();
  }
}
