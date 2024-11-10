#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

// Replace with your network credentials
const char* ssid = "realme GT 2";
const char* password = "12345678";

AsyncWebServer server(80); // Web server on port 80
AsyncWebSocket ws("/ws");  // WebSocket server on path "/ws"

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("Connected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // WebSocket event handler
  ws.onEvent(webSocketEvent);
  server.addHandler(&ws);

  // Start server
  server.begin();
}

void loop() {
  // Handle WebSocket communication
  ws.cleanupClients();
}

// WebSocket event handler
void webSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type, 
                    void* arg, uint8_t* data, size_t length) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.println("Client connected");
      break;
    case WS_EVT_DISCONNECT:
      Serial.println("Client disconnected");
      break;
    case WS_EVT_ERROR:
      Serial.println("Error");
      break;
    case WS_EVT_DATA:
      // Received data: parse it as JSON
      handleReceivedData(data, length);
      break;
  }
}

// Function to handle received data (buttons and joystick)
void handleReceivedData(uint8_t* data, size_t length) {
  // Convert data to a String
  String msg;
  for (size_t i = 0; i < length; i++) {
    msg += (char)data[i];
  }
  Serial.println("Received data: " + msg);

  // Parse the JSON data
  StaticJsonDocument<256> jsonDoc;
  DeserializationError error = deserializeJson(jsonDoc, msg);

  if (error) {
    Serial.println("Failed to parse JSON");
    return;
  }

  // Handle button data
  if (jsonDoc.containsKey("type") && strcmp(jsonDoc["type"], "bluetooth") == 0) {
    const char* status = jsonDoc["status"];
    Serial.print("Bluetooth status: ");
    Serial.println(status);
  } else if (jsonDoc.containsKey("type") && strcmp(jsonDoc["type"], "ps4") == 0) {
    const char* status = jsonDoc["status"];
    Serial.print("PS4 status: ");
    Serial.println(status);
  }

  // Handle left joystick data
  if (jsonDoc.containsKey("type") && strcmp(jsonDoc["type"], "joystick") == 0) {
    int joystickX = jsonDoc["x"];
    int joystickY = jsonDoc["y"];
    Serial.print("Left Joystick - X: ");
    Serial.print(joystickX);
    Serial.print(", Y: ");
    Serial.println(joystickY);
  }

  // Handle right joystick data
  if (jsonDoc.containsKey("type") && strcmp(jsonDoc["type"], "joystick_right") == 0) {
    int joystickXRight = jsonDoc["x"];
    int joystickYRight = jsonDoc["y"];
    Serial.print("Right Joystick - X: ");
    Serial.print(joystickXRight);
    Serial.print(", Y: ");
    Serial.println(joystickYRight);
  }
}
