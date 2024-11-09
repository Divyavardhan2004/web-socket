// Get elements
const screenLabel = document.getElementById("screen");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const canvas = document.getElementById("joystickCanvas");
const ctx = canvas.getContext("2d");

// WebSocket setup
const socket = new WebSocket(ws://192.168.93.243/ws);

socket.onopen = () => {
    console.log("WebSocket connection established.");
    screenLabel.textContent = "WebSocket Connected";
};

socket.onclose = () => {
    console.log("WebSocket connection closed.");
    screenLabel.textContent = "WebSocket Disconnected";
};

// Function to send data to ESP32
function sendToESP32(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error("WebSocket is not open.");
    }
}

// Start button event handler
startButton.addEventListener("click", () => {
    screenLabel.textContent = "PS4 ON";
    sendToESP32({ type: "ps4", status: "on" });
});

// Stop button event handler
stopButton.addEventListener("click", () => {
    screenLabel.textContent = "PS4 OFF";
    sendToESP32({ type: "ps4", status: "off" });
});

// Joystick variables
let isDragging = false;
const joystickRadius = 30; // Radius of the white circle (joystick handle)
const canvasRadius = canvas.width / 2;
const maxJoystickDistance = canvasRadius - joystickRadius; // Maximum allowed distance for the joystick handle
let joystickX = canvasRadius;
let joystickY = canvasRadius;

// Draw the joystick handle
function drawJoystick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw main circle (joystick boundary)
    ctx.beginPath();
    ctx.arc(canvasRadius, canvasRadius, canvasRadius - 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    // Draw white joystick handle
    ctx.beginPath();
    ctx.arc(joystickX, joystickY, joystickRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// Update coordinates and send data to ESP32
function updateCoordinates(x, y) {
    const deltaX = x - canvasRadius;
    const deltaY = y - canvasRadius;
    const distance = Math.sqrt(deltaX * 2 + deltaY * 2);

    // Normalize the distance and constrain it to the joystick boundary
    if (distance > maxJoystickDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        joystickX = canvasRadius + maxJoystickDistance * Math.cos(angle);
        joystickY = canvasRadius + maxJoystickDistance * Math.sin(angle);
    } else {
        joystickX = x;
        joystickY = y;
    }

    // Calculate normalized X and Y (-127 to 127)
    const normalizedX = Math.round(((joystickX - canvasRadius) / maxJoystickDistance) * 127);
    const normalizedY = Math.round(((joystickY - canvasRadius) / maxJoystickDistance) * 127);

    // Update screen label with coordinates
    screenLabel.textContent = X: ${normalizedX}, Y: ${normalizedY};

    // Send joystick data to ESP32
    sendToESP32({ type: "joystick", x: normalizedX, y: normalizedY });
}

// Handle mouse and touch events
function handleDrag(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    updateCoordinates(mouseX, mouseY);
    drawJoystick();
}

// Event listeners for dragging the joystick
canvas.addEventListener("mousedown", () => isDragging = true);
canvas.addEventListener("mouseup", () => {
    isDragging = false;
    // Reset joystick handle to the center
    joystickX = canvasRadius;
    joystickY = canvasRadius;
    drawJoystick();
    updateCoordinates(joystickX, joystickY);
});
canvas.addEventListener("mousemove", (e) => isDragging && handleDrag(e));
canvas.addEventListener("touchstart", () => isDragging = true);
canvas.addEventListener("touchend", () => {
    isDragging = false;
    // Reset joystick handle to the center
    joystickX = canvasRadius;
    joystickY = canvasRadius;
    drawJoystick();
    updateCoordinates(joystickX, joystickY);
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDragging) handleDrag(e.touches[0]);
});

// Initial drawing of joystick
drawJoystick();
