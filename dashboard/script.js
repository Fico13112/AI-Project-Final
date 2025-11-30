import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAayCWBU6252VQ-R9Q3kTJYkWMQZvDzywM",
  authDomain: "chatv3-a7d04.firebaseapp.com",
  projectId: "chatv3-a7d04",
  storageBucket: "chatv3-a7d04.appspot.com",
  messagingSenderId: "932472342537",
  appId: "1:932472342537:web:3da1e50ded87d7834c50d8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const avatarCard = document.getElementById("avatarCard");
const avatarImg = document.getElementById("avatarImg");
const avatarOverlay = document.querySelector(".avatar-overlay");
const avatarInput = document.getElementById("avatarInput");
const avatarSaveBtn = document.getElementById("avatarSave");

const displayNameEl = document.getElementById("displayName");
const emailTextEl = document.getElementById("emailText");
const descriptionText = document.getElementById("descriptionText");

const editNameBtn = document.getElementById("editNameBtn");
const editDescBtn = document.getElementById("editDescBtn");
const changePwBtn = document.getElementById("changePwBtn");
const changeEmailBtn = document.getElementById("changeEmailBtn");

const logoutBtn = document.getElementById("logoutBtn");

const modalAvatar = document.getElementById("modalAvatar");
const modalName = document.getElementById("modalName");
const modalDesc = document.getElementById("modalDesc");
const modalPw = document.getElementById("modalPw");
const modalEmail = document.getElementById("modalEmail");

const inputName = document.getElementById("inputName");
const inputDesc = document.getElementById("inputDesc");

const currentPw = document.getElementById("currentPw");
const newPw = document.getElementById("newPw");

const currentPwForEmail = document.getElementById("currentPwForEmail");
const newEmailInput = document.getElementById("newEmail");

const avatarPreview = document.getElementById("avatarPreview");

document.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", closeAllModals));
function showModal(modal){ modal.classList.add("show"); }
function closeAllModals(){ document.querySelectorAll(".modal").forEach(m => m.classList.remove("show")); }

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "../login/index.html";
    return;
  }

  emailTextEl.textContent = user.email || "";
  displayNameEl.textContent = user.displayName || "User";

  const udocRef = doc(db, "users", user.uid);
  const udoc = await getDoc(udocRef);
  if (udoc.exists()) {
    const data = udoc.data();
    descriptionText.textContent = data.description || "Description";
    if (data.avatarUrl) avatarImg.src = data.avatarUrl;
    if (data.username) displayNameEl.textContent = data.username;
  } else {
    await setDoc(udocRef, {
      username: user.displayName || "",
      email: user.email || "",
      description: "",
      avatarUrl: ""
    });
  }
});

avatarCard.addEventListener("click", ()=> showModal(modalAvatar));

avatarInput.addEventListener("change", (e)=>{
  const f = e.target.files[0];
  if (!f) return;
  avatarPreview.src = URL.createObjectURL(f);
});

avatarSaveBtn.addEventListener("click", async ()=>{
  const file = avatarInput.files[0];
  const user = auth.currentUser;
  if (!user) return alert("Not signed in.");
  if (!file) return alert("Choose a file first.");

  try {
    const refPath = `avatars/${user.uid}`;
    const sref = sRef(storage, refPath);
    await uploadBytes(sref, file);
    const url = await getDownloadURL(sref);

    
    try { await updateProfile(user, { photoURL: url }); } catch(e){}
    try { await updateDoc(doc(db, "users", user.uid), { avatarUrl: url }); } catch(e){}

    avatarImg.src = url;
    closeAllModals();
    alert("Profile picture updated.");
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  }
});

editNameBtn.addEventListener("click", ()=>{
  inputName.value = displayNameEl.textContent === "Username" ? "" : displayNameEl.textContent;
  showModal(modalName);
});
document.getElementById("nameSave").addEventListener("click", async ()=>{
  const val = inputName.value.trim();
  const user = auth.currentUser;
  if (!val) return alert("Enter username.");
  try {
    await updateProfile(user, { displayName: val }).catch(()=>{});
    await updateDoc(doc(db, "users", user.uid), { username: val });
    displayNameEl.textContent = val;
    closeAllModals();
    alert("Username saved.");
  } catch (err) {
    console.error(err);
    alert("Could not save: " + err.message);
  }
});

editDescBtn.addEventListener("click", ()=>{
  inputDesc.value = descriptionText.textContent === "Description" ? "" : descriptionText.textContent;
  showModal(modalDesc);
});
document.getElementById("descSave").addEventListener("click", async ()=>{
  const val = inputDesc.value.trim();
  const user = auth.currentUser;
  if (!user) return alert("Login required.");
  try {
    await updateDoc(doc(db, "users", user.uid), { description: val });
    descriptionText.textContent = val || "Description";
    closeAllModals();
    alert("Description updated.");
  } catch (err) {
    console.error(err);
    alert("Could not save description: " + err.message);
  }
});

changePwBtn.addEventListener("click", ()=> showModal(modalPw));
document.getElementById("pwSave").addEventListener("click", async ()=>{
  const cp = currentPw.value;
  const np = newPw.value;
  const user = auth.currentUser;
  if (!user) return alert("Login required.");
  if (!cp || !np) return alert("Enter current and new password.");
  if (np.length < 6) return alert("New password must be >= 6 chars.");
  try {
    const cred = EmailAuthProvider.credential(user.email, cp);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, np);
    closeAllModals();
    currentPw.value = ""; newPw.value = "";
    alert("Password changed.");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
});

changeEmailBtn.addEventListener("click", ()=> showModal(modalEmail));
document.getElementById("emailSave").addEventListener("click", async ()=>{
  const cp = currentPwForEmail.value;
  const newEmail = newEmailInput.value.trim();
  const user = auth.currentUser;
  if (!user) return alert("Login required.");
  if (!cp || !newEmail) return alert("Enter current password and new email.");
  try {
    const cred = EmailAuthProvider.credential(user.email, cp);
    await reauthenticateWithCredential(user, cred);
    await updateEmail(user, newEmail);
    await setDoc(doc(db, "emailChangeRequests", user.uid), {
      oldEmail: user.email,
      newEmail,
      requestedAt: new Date().toISOString()
    });
    await sendEmailVerification(user);
    await updateDoc(doc(db, "users", user.uid), { email: newEmail });
    closeAllModals();
    currentPwForEmail.value = ""; newEmailInput.value = "";
    alert("Email updated. Verification sent to the new address.");
  } catch (err) {
    console.error(err);
    alert("Email change failed: " + err.message);
  }
});

logoutBtn.addEventListener("click", async ()=>{
  try {
    await signOut(auth);
    window.location.href = "../login/index.html";
  } catch (err) {
    console.error(err);
    alert("Logout failed: " + err.message);
  }
});
