import { IResponse, IInvokation } from "@fractalwallet/types";
import BaseConnection from "@models/Base/BaseConnection";
import ConnectionNames from "@models/Connection/names";
import ProxyConnection from "@models/Connection/ProxyConnection";
import Invokation from "@models/Message/Invokation";

class MockedConnection extends BaseConnection {
  constructor() {
    super(ConnectionNames.BACKGROUND, ConnectionNames.CONTENT_SCRIPT);
  }

  public postMessage(_message: IResponse | IInvokation): void {
    return;
  }
}

describe("Unit Proxy Connection", () => {
  describe("proxy", () => {
    it("On 'proxy' on a proxy connection, a callback is registered to the method invokation on the source invokation", () => {
      // Prepare
      const method = "test_method";
      const sourceConnection = new MockedConnection();
      const destinationConnection = new MockedConnection();
      const proxyConnection = new ProxyConnection(
        sourceConnection,
        ConnectionNames.BACKGROUND,
        destinationConnection,
        ConnectionNames.CONTENT_SCRIPT,
      );

      // Execute
      proxyConnection.proxy(method);

      // Assert
      expect(sourceConnection.invokationCallbacks).toHaveProperty(method);
      expect(
        Object.keys(destinationConnection.invokationCallbacks),
      ).toHaveLength(0);
    });
  });
  describe("reversedProxy", () => {
    it("On 'reversedProxy' on a proxy connection, a callback is registered to the method invokation on the destination", () => {
      // Prepare
      const method = "test_method";
      const sourceConnection = new MockedConnection();
      const destinationConnection = new MockedConnection();
      const proxyConnection = new ProxyConnection(
        sourceConnection,
        ConnectionNames.BACKGROUND,
        destinationConnection,
        ConnectionNames.CONTENT_SCRIPT,
      );

      // Execute
      proxyConnection.reversedProxy(method);

      // Assert
      expect(destinationConnection.invokationCallbacks).toHaveProperty(method);
      expect(Object.keys(sourceConnection.invokationCallbacks)).toHaveLength(0);
    });
  });
});
