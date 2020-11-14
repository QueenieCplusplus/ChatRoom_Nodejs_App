# ChatRoom_Nodejs_App
test FirebaseRTC API & Firebase DB &amp; RTC-supported Browser 

# Firebase DB & Firebase Host

     // see firebase.json

    {
      "database": {
        "rules": "database.rules.json"
      },
      "hosting": {
        "public": "public",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }

# npm pkg

npm 套件需追加 TLS 、 firebase shell 、RTCPeerConnection。

# WebRTC API


![](https://raw.githubusercontent.com/QueenieCplusplus/ChatRoom_Nodejs_App/main/FlowProcess.png)

* RTCPeerConnection (for JS)
  
  The JavaScript object used to create a WebRTC connection. The WebRTC adapter JavaScript source provides a standard interface so that you don't have to create custom code for each browser-specific implementation.
  
* Interactive Connectivity Establishment (ICE)

  Method used by WebRTC to discover the optimal way to create a peer-to-peer connection. Peers exchange ICE candidates that are negotiated and prioritized until a common connection method is agreed upon.
  
* know-how +plus

   The RTCPeerConnection "data channel" is an arbitrary data stream linked to the peer connection that uses the same connection methods as the video and audio tracks.
  
# Peer Connection

* Traversal Using Relays around NAT (TURN)

  An external service used as a relay by peers if no direct peer-to-peer.
  
* Session Traversal Utilities for NAT (STUN)
  
  An external service used by peers to discover their real external IP address if they are behind a firewall or NAT gateway.

# WebRTC

a Streaming App & Desk Remote App solution.

WebRTC can be quite complex due to complexity of mixed protocols, it is abstracted than the web browser's APIs. Now we sum up the core concept the RTC included.

* Datagram Transport Layer Security (DTLS)

  An implementation of the Transport Layer Security specification that can be used over User Datagram Protocol (UDP). WebRTC requires all data to be encrypted in transit and uses DTLS to secure data transmission.

* Session Description Protocol (SDP)
  
  Media and connection configuration and capabilities exchanged by peers during connection establishment.


* signaling

  An external service used by peer connections that is not included in the WebRTC specification, but is required for connection establishment. Although there is no formal specification for signaling, it is common to use a WebSocket or Extensible Messaging and Presence Protocol (XMPP).




