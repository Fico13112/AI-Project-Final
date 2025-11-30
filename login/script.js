window.showForm = function (id) {
  document.querySelectorAll(".form-box").forEach(f => f.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAayCWBU6252VQ-R9Q3kTJYkWMQZvDzywM",
  authDomain: "chatv3-a7d04.firebaseapp.com",
  projectId: "chatv3-a7d04",
  storageBucket: "chatv3-a7d04.appspot.com",
  messagingSenderId: "932472342537",
  appId: "1:932472342537:web:3da1e50ded87d7834c50d8",
  measurementId: "G-BET3GCKVF6"
};

// --- INIT FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SWITCH FORM ---
window.showForm = function (id) {
  document.querySelectorAll(".form-box").forEach(f => f.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

// --- REGISTER ---
document.getElementById("register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const role = document.getElementById("register-role").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name, email, role, createdAt: new Date(),
    });
    alert("✅ Account created! Now we’ll capture your face.");
    await captureFace(userCred.user.uid, name);
    alert("✅ Face saved! You can now log in.");
    showForm("login-form");
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// --- LOGIN ---
document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    alert("🔍 Logged in. Starting Face ID verification...");
    await startFaceCheck(userCred.user.uid);
  } catch (error) {
    alert("❌ " + error.message);
  }
});

function createCameraUI(titleText = "Camera Active") {
  // Prevent duplicates
  if (document.querySelector(".camera-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "camera-wrapper";

  // Title
  const title = document.createElement("h3");
  title.className = "camera-title";
  title.innerText = titleText;

  // Video
  const video = document.createElement("video");
  video.id = "video";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;

  // Overlay for detection visuals
  const canvas = document.createElement("canvas");
  canvas.id = "overlay";

  // Status text
  const status = document.createElement("div");
  status.className = "camera-status";
  status.innerText = "Starting camera...";

  wrapper.appendChild(title);
  wrapper.appendChild(video);
  wrapper.appendChild(canvas);
  wrapper.appendChild(status);
  document.body.appendChild(wrapper);

  return { video, canvas, status };
}


// --- FACE CAPTURE FOR NEW USERS ---
async function captureFace(uid, name) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./face-api.js-master/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./face-api.js-master/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./face-api.js-master/models")
  ]);
  
  const { video, status } = createCameraUI("Face ID Verification");


  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  alert("📸 Look at the camera for 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));

  const result = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) {
    alert("❌ No face detected, please try again.");
    stream.getTracks().forEach(t => t.stop());
    document.querySelector(".camera-wrapper")?.remove();
    return;
  }

  await setDoc(doc(db, "faces", uid), {
    name,
    descriptor: Array.from(result.descriptor),
  });

  stream.getTracks().forEach(t => t.stop());
  video.remove();
}

// --- FACE VERIFICATION AT LOGIN ---
async function startFaceCheck(uid) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./face-api.js-master/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./face-api.js-master/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./face-api.js-master/models")
  ]);

  const data = await getDoc(doc(db, "faces", uid));
  if (!data.exists()) {
    alert("❌ No saved face found. Register again.");
    return;
  }

  const storedDescriptor = new Float32Array(data.data().descriptor);
  const labeledFace = new faceapi.LabeledFaceDescriptors(data.data().name, [storedDescriptor]);
  const matcher = new faceapi.FaceMatcher([labeledFace], 0.5);

  const { video, status } = createCameraUI("Face ID Verification");
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  alert("🧠 Look into the camera to verify your identity...");
  const interval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) return;

    const match = matcher.findBestMatch(detections[0].descriptor);
    if (match.label !== "unknown") {
      alert(`✅ Welcome, ${match.label}!`);
      clearInterval(interval);
      stream.getTracks().forEach(t => t.stop());
      document.querySelector(".camera-wrapper")?.remove();
      window.location.href = "../dashboard/index.html";
    }
  }, 1000);
}

const header = document.getElementById('header');
const toggleBtn = document.getElementById('navToggle');
let headerVisible = true;

toggleBtn.addEventListener('click', () => {
  headerVisible = !headerVisible;

  header.classList.toggle('hide', !headerVisible);

  // Change toggle icon to indicate action
  toggleBtn.innerHTML = headerVisible
    ? '<i class="fa-solid fa-chevron-up"></i>'
    : '<i class="fa-solid fa-chevron-down"></i>';
});

