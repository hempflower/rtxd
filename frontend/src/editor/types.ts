export type ActionPayload = {
  data: unknown;
  type: string;
};

export type DataType = "string" | "number" | "bytes" | string;
export type DataPayload = {
    data: unknown;
    type: DataType;
}

export type ActionFn = (data?: ActionPayload) => void;
export type DataFn = () => DataPayload | null;
