#  AI Figurine & Avatar Interaction System

This project extends the open-source [Character Studio](https://github.com/M3-org/CharacterStudio/) framework to create an interactive AI Figurine system. It allows users to customize 3D characters, preview animations, and engage in voice-driven conversations using integrated AI technologies.

##  Features

- Modular figurine customization (parts, textures, and materials)
- Animation preview with FBX support
- AI-powered conversational agent (OpenAI GPT + ElevenLabs)
- Voice playback and Emotion-based animation control 
- User-defined animations and component upload


---

## Getting Started
This project contains two main parts:

- `/frontend` — the user interface for figurine customization and AI interaction  
- `/backend` — the API services (e.g., proxy, asset handling)


### 1. Clone the Repository

```bash
git clone https://xxxxx
cd xxxx
```
### 2. Set Up the Backend
```bash
cd backend
yarn
yarn dev
```
Ensure environment variables are correctly configured in `backend/.env`  
`
VITE_OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=your_openai_base_url
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
`
### 3. Set Up the Frontend
```bash
cd ../frontend
npm install
npm run get-assets    # Download default figurine assets
npm run dev
```
---

## Project Structure


### Main Pages

| Path | Description |
|------|-------------|
| `Dashboard.jsx` | Navigation hub between modules |
| `TestAnimation.jsx` | Figurine customization & animation preview |
| `TestAppearance.jsx` | AI interaction and chat interface |

### UI Components and Layout

Located in `/src/components/`:

| File | Purpose |
|------|---------|
| `Background.jsx` | Renders the 3D scene background |
| `TestRightPanel.jsx` | Right-side panel in Figurine Customization Module |
| `TestBottomDisplayMenu.jsx` | Bottom UI panel in Figurine Customization Module |
| `AnimationRightPanel.jsx` | Right-side panel in AI-Driven Conversation Module |
| `TestAnimationBottomDisplayMenu.jsx` | Bottom UI panel in AI-Driven Conversation Module |

### Figurine Animation Assets

Located in `/public/animations/`  
Contains FBX animation clips sourced from **Mixamo** for motion playback and emotion-driven response.


### View Management
Located in `/src/context/ViewContext.jsx`  
Controls internal view transitions using React Context API.


### AI Interaction Hook
Located in  `/src/hooks/useChat.jsx`  
  Handles OpenAI chat logic, voice synthesis via ElevenLabs, and animation triggering.
  

### Figurine Control

Located in `/src/library/animationManager.js`:
Manages animation state and emotion mapping 


---



## License
This project builds upon [Character Studio](https://github.com/M3-org/CharacterStudio/), licensed under the MIT License.
All modifications are under the same open-source terms.

