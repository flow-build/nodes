export type NodeSpec = {
  id: string;
  name: string;
  type: string;
  next: string;
  category?: string;
  lane_id: string;
  on_error?: string;
  extract?: string;
  parameters: {};
}

export type ProcessState = {
  node_id: string,
  bag: {},
  external_input: {},
  result: NodeResult,
  error: string | null,
  status: ProcessStatus,
  next_node_id: string,
  time_elapsed: number,
}

export type NodeResult = any

export enum ProcessStatus {
  RUNNING = "running",
  ERROR = "error",
  WAITING = "waiting",
  PENDING = "pending",
  FINISHED = "finished",
}