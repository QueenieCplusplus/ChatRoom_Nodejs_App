mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));

// DEfault configuration - Change these if you have a different STUN or TURN server.
const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null; // 聊天室套件產生的重要物件
let localStream = null; // 本機串流
let remoteStream = null; // 遠端串流
let roomDialog = null; // 房間對話
let roomId = null; // 房間鑰匙

// 畫面 UI 按鈕功能
// 針對聊天室功能按鈕產生的事件，觸發倍呼叫的函式
function init() {
  document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);
  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog')); // 使用 mdc 命名空間產生的聊天訊息
}

// （1）建立房間
  // to firebase
      // 1. Code for creating a room below 報價者向 firebase 申請創建聊天室後產生房間本機描述資訊。
      // 2. Listening for remote session description below 為房間建立（會議產生的描述）事件聆聽器。
      // 3. Creating SDP answer below

async function createRoom() {

  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;
  const db = firebase.firestore(); // 創建資料庫

  console.log('Create PeerConnection with configuration: ', configuration);
  peerConnection = new RTCPeerConnection(configuration); // 創建 RTCPeerConnection 物件

  registerPeerConnectionListeners();

  const offer = await peerConnection.createOffer(); // first line to create a room, it is a RTCSessionDescription
  await peerConnection.setLocalDescription(offer); // setup is for Local Description. Local 訊息指報價者的資訊
  
  const roomWithOffer = {
      offer: {
          type: offer.type,
          sdp: offer.sdpㄓ
      }
  }
  const roomRef = await db.collection('rooms').add(roomWithOffer); // Room from Firebase
  const roomId = roomRef.id; // 從房間物件中取出 ID 鑰匙訊息
  document.querySelector('#currentRoom').innerText = `Current room is ${roomId} - You are the caller!` // roomID is Firebase Object.

  roomRef.onSnapshot(async snapshot -> { // 快照取出房間描述訊息

    console.log('Got updated room:', snapshot.data());
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data.answer) {
        console.log('Set remote description: ', data.answer);
        const answer = new RTCSessionDescription(data.answer)
        await peerConnection.setRemoteDescription(answer);
    }
  });

  const offer = roomSnapshot.data().offer;
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  const roomWithAnswer = {
      answer: {
          type: answer.type,
          sdp: answer.sdp
      }
  }
  await roomRef.update(roomWithAnswer);

  
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.addEventListener('track', event => {
    console.log('Got remote track:', event.streams[0]);
    event.streams[0].getTracks().forEach(track => {
      console.log('Add a track to the remoteStream:', track);
      remoteStream.addTrack(track);
    });
  });
}

// （2）收集遠端聊天室呼叫者
// for browser
  // 4. Code for collecting ICE candidates below 在 firebase 加入候選人資並且產生事件訊號
  // 5. Listen for remote ICE candidates below 聆聽遠端候選人資訊

async function collectIceCandidates(roomRef, peerConnection,localName, remoteName) {

  const candidatesCollection = roomRef.collection(localName);

  peerConnection.addEventListener('icecandidate', event -> { // 在資料庫追加候選人並產生事件
    if (event.candidate) {
      const json = event.candidate.toJSON();
      candidatesCollection.add(json);
    }
  });

  roomRef.collection(remoteName).onSnapshot(snapshot -> {

    snapshot.docChanges().forEach(change -> {
        
      if (change.type === "added") { // Firebase 資料庫欄位加入此事件訊號時會產生快照的回呼

        const candidate = new RTCIceCandidate(change.doc.data()); // 建構新的候選人
        peerConneciton.addIceCandidate(candidate); // WebRTC 連線中加入候選人

       }

    });

  })

}


// （3）加入聊天室
function joinRoom() {
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;

  document.querySelector('#confirmJoinBtn').
      addEventListener('click', async () => {
        roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
        await joinRoomById(roomId);
      }, {once: true});
  roomDialog.open();
}

// 遠端候選人使用房間鑰匙
async function joinRoomById(roomId) {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(`${roomId}`);
  const roomSnapshot = await roomRef.get();
  console.log('Got room:', roomSnapshot.exists);

  if (roomSnapshot.exists) {
    console.log('Create PeerConnection with configuration: ', configuration);
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });


    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });
  }
}

// 建立視訊媒體
async function openUserMedia(e) {
  const stream = await navigator.mediaDevices.getUserMedia(
      {video: true, audio: true});
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;

  console.log('Stream:', document.querySelector('#localVideo').srcObject);
  document.querySelector('#cameraBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = false;
  document.querySelector('#createBtn').disabled = false;
  document.querySelector('#hangupBtn').disabled = false;
}

// 閒置房間
async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';
  
  // 刪除聊天室/閒置聊天室
  // Delete room on hangup
  if (roomId) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(roomId);
    const calleeCandidates = await roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async candidate => {
      await candidate.delete();
    });
    const callerCandidates = await roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async candidate => {
      await candidate.delete();
    });
    await roomRef.delete();
  }

  document.location.reload(true);
}


// 註冊事件聆聽器
function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

init();
// COL: 250
