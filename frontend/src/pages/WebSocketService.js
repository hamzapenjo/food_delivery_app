class WebSocketService {
    static instance = null;
    callbacks = {};
  
    static getInstance() {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
  
    connect(userId, role) {
      const token = localStorage.getItem("token");
      const wsUrl = `ws://127.0.0.1:8000/ws/${userId}/${role}?token=${token}`;
      console.log(wsUrl);
      this.socket = new WebSocket(wsUrl);
  
      this.socket.onopen = () => {
        console.log("WebSocket connection opened");
      };
  
      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };
  
      this.socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
  
      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  
    addCallbacks(callback) {
      this.callbacks["messages"] = callback;
    }
  
    handleMessage(data) {
      const parsedData = JSON.parse(data);
      if (this.callbacks["messages"]) {
        this.callbacks["messages"](parsedData);
      }
    }
  
    sendMessage(messageData) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(messageData));
      } else {
        console.error("WebSocket is not open. Can't send message.");
      }
    }
  }
  
  const WebSocketInstance = WebSocketService.getInstance();
  export default WebSocketInstance;
  