# Collaborative Whiteboard

A real-time collaborative whiteboard application that allows multiple users to draw, chat, and interact on a shared canvas. Built with React, TypeScript, Keycloak authentication, and modern UI libraries.

## Features

- Real-time collaborative drawing
- Multiple brush types, colors, and shapes
- Session management (create/join sessions)
- User presence and cursor tracking
- Integrated chat for team communication
- Export whiteboard as PNG or PDF
- Invite users via email
- Secure authentication with Keycloak
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend:** React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Authentication:** Keycloak
- **Real-time Communication:** Socket.io
- **PDF/Image Export:** jsPDF, Canvas API

## Getting Started

### Prerequisites
- Node.js & npm ([install guide](https://github.com/nvm-sh/nvm#installing-and-updating))
- Keycloak server running locally (for authentication)

### Setup
1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Keycloak:**
   - Update `src/keycloak.ts` with your Keycloak server URL, realm, and client ID if needed.
   - Ensure your Keycloak client has the correct redirect URIs and web origins.
4. **Start the development server:**
   ```sh
   npm run dev
   ```
5. **Open your browser:**
   - Visit [http://localhost:8080](http://localhost:8080)

## Deployment

You can deploy this project using any platform that supports Node.js and static site hosting (e.g., Vercel, Netlify, AWS, DigitalOcean). Make sure to update Keycloak settings for your production domain.

## Custom Domain

To use a custom domain, configure your deployment platform and update Keycloak client settings accordingly.

## License

MIT
