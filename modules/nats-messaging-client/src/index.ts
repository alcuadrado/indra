import { Node } from "@counterfactual/types";
import * as nats from "ts-nats";

export interface NatsConfig {
  clusterId?: string;
  servers: string[];
  token?: string;
  payload?: nats.Payload;
}

export const NATS_CONFIGURATION_ENV = {
  clusterId: "NATS_CLUSTER_ID",
  servers: "NATS_SERVERS",
  token: "NATS_TOKEN",
};

export interface INatsMessaging extends Node.IMessagingService {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getConnection: () => nats.Client;
}

export class NatsServiceFactory {
  constructor(private readonly connectionConfig: NatsConfig) {}

  connect() {
    throw Error("Connect service using NatsMessagingService.connect()");
  }

  createMessagingService(messagingServiceKey: string): NatsMessagingService {
    return new NatsMessagingService(this.connectionConfig, messagingServiceKey);
  }
}

export class NatsMessagingService implements INatsMessaging {
  private connection: nats.Client | undefined;

  constructor(
    private readonly configuration: NatsConfig,
    private readonly messagingServiceKey: string,
  ) {}

  async connect() {
    this.connection = await nats.connect(this.configuration);
  }

  getConnection() {
    if (!this.connection) {
      throw Error("No connection exists");
    }

    return this.connection;
  }

  async send(to: string, msg: Node.NodeMessage) {
    if (!this.connection) {
      console.error(
        "Cannot register a connection with an uninitialized nats server",
      );
      return;
    }

    this.connection.publish(
      `${this.messagingServiceKey}.${to}.${msg.from}`,
      JSON.stringify(msg),
    );
  }

  onReceive(address: string, callback: (msg: Node.NodeMessage) => void) {
    if (!this.connection) {
      console.error(
        "Cannot register a connection with an uninitialized nats server",
      );
      return;
    }

    this.connection.subscribe(
      `${this.messagingServiceKey}.${address}.>`,
      (err, msg) => {
        if (err) {
          console.error(
            "Encountered an error while handling message callback",
            err,
          );
        } else {
          callback(JSON.parse(msg.data) as Node.NodeMessage);
        }
      },
    );
  }

  async disconnect() {
    if (!this.connection) {
      console.error("No connection exists");
      return;
    }

    this.connection.close();
  }
}

export function confirmNatsConfigurationEnvVars() {
  if (
    !process.env.NATS_SERVERS ||
    !process.env.NATS_TOKEN ||
    !process.env.NATS_CLUSTER_ID
  ) {
    throw Error(
      "Nats server name(s), token and cluster ID must be set via env vars",
    );
  }
}
