let webSocket = null;

function connect() {
    webSocket = new WebSocket('wss://example.com/ws');

    webSocket.onopen = (event) => {
        console.log('websocket open');
        keepAlive();
    };

    webSocket.onmessage = (event) => {
        console.log(`websocket received message: ${event.data}`);
    };

    webSocket.onclose = (event) => {
        console.log('websocket connection closed');
        webSocket = null;
    };
}

function disconnect() {
    if (webSocket == null) {
        return;
    }
    webSocket.close();
}

function keepAlive() {
    const keepAliveIntervalId = setInterval(
        () => {
            if (webSocket) {
                webSocket.send('keepalive');
            } else {
                clearInterval(keepAliveIntervalId);
            }
        },
        // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
        20 * 1000
    );
}
