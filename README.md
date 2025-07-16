# AHA-Frontend

A modern React chat application built with Vite, featuring real-time messaging, file uploads, and a responsive user interface.

## 🚀 Features

- **Real-time Chat**: Stream-based messaging with typing indicators
- **File Uploads**: Support for images, PDFs, and text files with drag-and-drop
- **Voice Recording**: Record and send voice messages
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **User Authentication**: Cookie-based authentication system
- **Conversation Management**: Create, view, and manage multiple chat rooms
- **Markdown Support**: Rich text formatting in messages
- **Image Preview**: Modal image viewer with zoom capabilities

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Markdown**: React Markdown with rehype-sanitize
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useRef)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AHA-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatWindow.jsx   # Main chat display component
│   ├── ChatInput.jsx    # Message input with file upload
│   ├── ChatLayout.jsx   # Chat page layout wrapper
│   ├── MarkdownWrapper.jsx  # Markdown rendering component
│   └── ImagePreviewModal.jsx # Image preview modal
├── pages/               # Page components
│   ├── ChatPage.jsx     # Main chat page with state management
│   └── ...
├── controllers/         # API service layer
│   ├── chat.js          # Chat-related API calls
│   └── ...
├── config/              # Configuration files
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css            # Global styles with Tailwind
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=AHA Chat
```

### Nginx Configuration
The project includes an `nginx.conf` file for production deployment with proper routing support.

## 🎨 UI Components

### ChatWindow
- Displays conversation messages
- Handles message ordering and validation
- Supports image display with click-to-preview
- Auto-scrolling with smooth animations

### ChatInput
- Multi-line text input with auto-resize
- File upload with drag-and-drop support
- Voice recording functionality
- Real-time file preview

### ChatLayout
- Responsive sidebar with conversation list
- Header with chat title
- Mobile-friendly navigation

## 📱 Features in Detail

### File Upload System
- **Supported formats**: Images (JPEG, PNG, GIF, WebP, SVG), PDFs, text files
- **File size limit**: 10MB per file
- **Upload methods**: Click to browse, drag-and-drop, paste from clipboard
- **Preview**: Immediate thumbnail preview for images

### Real-time Messaging
- **Streaming responses**: Real-time message streaming from backend
- **Typing indicators**: Visual feedback when bot is responding
- **Message status**: Pending, delivered, and failed states
- **Auto-scroll**: Smart scrolling to keep latest messages visible

### Voice Recording
- **Browser API**: Uses MediaRecorder API for voice capture
- **Real-time feedback**: Recording timer and visual indicators
- **Audio format**: WAV format for compatibility

## 🔐 Authentication

The application uses cookie-based authentication:
- User data stored in browser cookies
- Automatic login state management
- Redirect to login page when unauthenticated

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t aha-frontend .

# Run container
docker run -p 80:80 aha-frontend
```

### Manual Deployment
```bash
# Build for production
npm run build

# Serve the dist folder with your preferred web server
```

## 🧪 Development

### Code Style
- ESLint configuration for React
- Consistent formatting with Prettier
- Modern JavaScript/ES6+ features

### Key Dependencies
- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `react-router-dom`: ^6.0.0
- `axios`: HTTP client
- `js-cookie`: Cookie management
- `react-markdown`: Markdown rendering
- `lucide-react`: Icon library
- `tailwindcss`: Utility-first CSS

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](issues) section
2. Create a new issue with detailed description
3. Include browser version and error messages

---

Built with ❤️ using React and Vite