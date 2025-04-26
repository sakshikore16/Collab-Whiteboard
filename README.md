# 🖊️ Collaborative Whiteboard

A modern, real-time collaborative whiteboard web application built with React, TypeScript, Bootstrap 5, and Fabric.js. Draw, brainstorm, and collaborate with your team—anywhere, anytime.

---

## 🚀 Live Demo

👉 [collab-whiteboard.vercel.app](https://collab-whiteboard.vercel.app)

---

## 🚀 Features

- **Real-Time Collaboration:**  
  Create or join whiteboard sessions and draw together with live updates.

- **Authentication:**  
  Secure login and signup using Keycloak (Dockerized for easy setup).

- **Drawing Tools:**  
  - Multiple brush types (pen, highlighter, fill)
  - Adjustable brush sizes and colors
  - Eraser tool
  - Shape tools: rectangle, circle, arrow, and text

- **Undo/Redo:**  
  Effortlessly revert or reapply your last actions.

- **Live Cursors:**  
  See other users’ cursors and drawing actions in real time.

- **Export Options:**  
  Save your whiteboard as a PNG image or PDF file.

- **Session Management:**  
  - Invite users via email
  - Join sessions with a code

- **Live Chat:**  
  Collaborate via integrated chat while drawing.

- **Export as Video:**  
  Download a video playback of your drawing session.

- **Responsive Design:**  
  Works seamlessly on desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Bootstrap 5, Fabric.js
- **Authentication:** Keycloak (Docker)
- **Real-Time:** (WebSocket/Socket.io or real-time DB integration recommended)
- **State Management:** React Context API
- **PDF/Image Export:** jsPDF, Fabric.js
- **Bonus:** Email invitations, live chat, video export

---

## 📦 Getting Started

### 1. **Clone the Repository**
```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Configure Keycloak**
- Copy `.env.example` to `.env` and fill in your Keycloak details:
  ```
  KEYCLOAK_URL=https://your-keycloak-server/auth
  KEYCLOAK_REALM=your-realm
  KEYCLOAK_CLIENT_ID=your-client-id
  ```
- **Default login for testing:**  
  - Username: `sakshikore`  
  - Password: `sakshikore`

### 4. **Run the App**
```sh
npm run dev
```
Visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📝 Usage

1. **Sign up or log in** using your credentials.
2. **Create a new session** or **join an existing one**.
3. **Draw, chat, and collaborate** in real time.
4. **Export** your whiteboard as an image, PDF, or video.
5. **Invite others** to your session via email.

---

## 📸 Screenshots

> _Add screenshots or GIFs here to showcase your UI and features!_

---

## 🧩 Architecture

- **Whiteboard:** Fabric.js canvas, with all actions tracked for undo/redo and export.
- **Sessions:** Managed via React Context and Keycloak authentication.
- **Real-Time:** (Optional) Integrate with WebSocket or a real-time DB for multi-user sync.
- **UI:** Bootstrap 5 for a clean, professional, and responsive layout.

---

## 🛡️ Security

- All endpoints and whiteboard sessions are protected by Keycloak authentication.
- Only authorized users can access and collaborate on whiteboards.

---

## 💡 Extra Features

- Live chat for seamless communication.
- Email invitations for easy collaboration.
- Export your drawing process as a video.

---

## 🏆 Bonus Ideas

- Add more shapes, templates, or sticky notes.
- Integrate with Google Drive or Dropbox for saving boards.
- Add voice/video chat for richer collaboration.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 🙏 Acknowledgements

- [Fabric.js](http://fabricjs.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Keycloak](https://www.keycloak.org/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [React](https://react.dev/)

---

> _Built with ❤️ by sakshikore._
