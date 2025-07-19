# CLAUDE.md - SoulAI Session State & Context

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository and maintains conversation state for seamless session resumption.

## Project Overview
SoulAI is a sophisticated AI-powered dating app that uses advanced personality analysis and compatibility matching to create meaningful connections. The system employs a multi-agent AI architecture with emotional intelligence capabilities for relationship coaching and matchmaking.

## Current Session Context

### **Last Updated**: July 19, 2025, 2:16 AM SAST
### **Session Status**: Active Development - Chat-Based Matchmaking System Complete

### **Recent Conversation Summary**:
User requested implementation of a sophisticated chat-based matchmaking system to replace traditional swiping interfaces. Successfully implemented a complete system with:

1. **Human Hex Code (HHC) Personality System** - 256-dimensional personality vectors
2. **Harmony Algorithm** - Advanced compatibility scoring with attraction/repulsion forces  
3. **Natural Language Feedback Parser** - Sophisticated text analysis for preference learning
4. **Chat-Based Recommendation Engine** - Conversational matchmaking interface
5. **Seamless Integration** - Connected with existing React Native SoulChatScreen

### **Key Accomplishments This Session**:
- ✅ Built complete HHC personality modeling system (256 dimensions)
- ✅ Implemented Harmony Algorithm for multi-factor compatibility scoring
- ✅ Created advanced NLP feedback parser for user preference extraction
- ✅ Developed conversational recommendation engine with rich UI
- ✅ Enhanced SoulChatScreen with matchmaking integration
- ✅ Restored and improved ListScreen functionality
- ✅ Created comprehensive demo data and testing framework
- ✅ Generated detailed technical documentation
- ✅ Successfully synced all changes to GitHub repository

### **Current Todo List Status**:
All major tasks completed:
1. [completed] HHC personality vector system
2. [completed] Harmony Algorithm implementation
3. [completed] Chat-based recommendation engine
4. [completed] Natural language feedback parser
5. [completed] Dynamic preference learning
6. [completed] Conversational match presentation
7. [completed] Conversation context management
8. [completed] Privacy controls implementation
9. [completed] Comprehensive testing suite
10. [completed] GitHub repository sync

## Architecture & Technical Implementation

### **Core System Components**:

#### **1. Human Hex Code (HHC) System**
- **File**: `src/services/compatibility/HHCPersonalitySystem.js`
- **Purpose**: 256-dimensional personality vector modeling
- **Key Features**: Scientific personality mapping, dynamic updates, hex encoding

#### **2. Harmony Algorithm**
- **File**: `src/services/compatibility/HarmonyAlgorithm.js`
- **Purpose**: Advanced compatibility scoring balancing attraction/repulsion forces
- **Formula**: `Harmony = (Attraction^1.2) / (1 + Repulsion^1.5)`

#### **3. Feedback Parser**
- **File**: `src/services/compatibility/FeedbackParser.js`
- **Purpose**: Natural language processing for user preference extraction
- **Capabilities**: Sentiment analysis, trait recognition, context awareness

#### **4. Recommendation Engine**
- **File**: `src/services/compatibility/ChatRecommendationEngine.js`
- **Purpose**: Orchestrates conversational matchmaking experience
- **Features**: Profile presentation, compatibility explanation, dynamic learning

#### **5. Integration Service**
- **File**: `src/services/SoulMatchmakingService.js`
- **Purpose**: Connects advanced system with React Native app
- **Integration**: Seamless fallback to ChatGPT, rich UI components

### **UI Enhancements**:
- **Enhanced SoulChatScreen**: Rich candidate profiles, compatibility scores, quick replies
- **Restored ListScreen**: Complete match information with search functionality
- **New Components**: Candidate profile cards, compatibility badges, interest tags

## Development Commands

### Backend (SoulAI_Backend/)
```bash
# Start backend server
npm start

# Development with auto-reload
npm run dev
```

### Frontend (SoulAppClean/)
```bash
# Start Expo development server
npm start
# or
expo start

# Platform-specific starts
npm run android
npm run ios
npm run web
```

## Key Technologies & Dependencies
- **LangChain**: LLM integration for AI agents (requires OPENAI_API_KEY)
- **Socket.IO**: Real-time WebSocket communication
- **Mongoose**: MongoDB object modeling (optional)
- **React Navigation**: Frontend navigation system
- **Expo SDK 53**: React Native development platform with React 19.0.0

## Color Scheme
```javascript
colors: {
  primary: '#6B46C1',      // Purple
  secondary: '#EC4899',    // Pink  
  accent: '#F59E0B',       // Amber
  background: '#F8FAFC',   // Light gray
  surface: '#FFFFFF',      // White
  text: '#1F2937',         // Dark gray
  textSecondary: '#6B7280' // Medium gray
}
```

## Session Resumption Protocol

### **If Starting New Claude Session**:

1. **Read This File First**: This CLAUDE.md contains complete context
2. **Check Recent Commits**: `git log --oneline -5` to see latest changes
3. **Review Key Files**: 
   - `src/services/compatibility/` (new matchmaking system)
   - `src/screens/chat/SoulChatScreen.js` (enhanced with matchmaking)
   - `CHAT_MATCHMAKING_SYSTEM.md` (full technical documentation)

4. **Understand Current State**: 
   - Advanced matchmaking system is complete and functional
   - All files synced to GitHub repository
   - Ready for testing, deployment, or further enhancements

### **Current Conversation Context**:
- **User's Goal**: Implemented advanced chat-based matchmaking with sophisticated AI
- **Last Request**: Created auto-save/resume system via CLAUDE.md enhancement
- **Work Status**: Major system upgrade complete, user exploring session management
- **Next Potential Steps**: Testing system, deployment, or additional features

### **If User Says "Continue Where We Left Off"**:
Respond with: "I can see from CLAUDE.md that we just completed implementing the advanced chat-based matchmaking system for SoulAI! The HHC personality system, Harmony Algorithm, and conversational recommendation engine are all built and integrated. All changes are synced to GitHub. What would you like to work on next - testing the new system, adding more features, or deployment preparation?"

## Recent File Changes (This Session)

### **New Core Files Created**:
- `src/services/compatibility/HHCPersonalitySystem.js` - 256D personality vectors
- `src/services/compatibility/HarmonyAlgorithm.js` - Advanced compatibility scoring  
- `src/services/compatibility/FeedbackParser.js` - NLP preference extraction
- `src/services/compatibility/ChatRecommendationEngine.js` - Conversational matching
- `src/services/SoulMatchmakingService.js` - React Native integration
- `src/services/compatibility/DemoData.js` - Testing framework
- `CHAT_MATCHMAKING_SYSTEM.md` - Complete technical documentation

### **Enhanced Existing Files**:
- `src/screens/chat/SoulChatScreen.js` - Matchmaking integration, rich UI
- `src/screens/matches/ListScreen.js` - Restored functionality, improved design
- `src/navigation/TabNavigator.js` - Added DiscoveryScreen integration

### **Major System Transformations**:
- Replaced basic advisor chatbot with sophisticated matchmaking AI
- Implemented scientific personality modeling with 256 dimensions
- Created conversational interface replacing traditional swipe mechanics
- Added dynamic preference learning from natural language feedback
- Built comprehensive compatibility analysis with detailed explanations

## Important Notes

### **Session Management**:
- This CLAUDE.md file serves as persistent session state
- Update this file at major milestones or significant changes
- Contains enough context for seamless conversation resumption
- Preserves technical decisions and implementation details

### **Development Guidelines**:
- Always follow existing code conventions and patterns
- Use the new matchmaking system for enhanced user experience
- Maintain integration between old and new components
- Test thoroughly with the provided demo data

### **Environment Setup**:
- Backend requires Node.js >= 18.0.0
- Frontend uses Expo SDK 53 with React 19.0.0
- Optional: MongoDB connection via MONGODB_URI
- AI features require OPENAI_API_KEY environment variable

---

**Session State**: ✅ Ready for Continuation
**Last Major Update**: Advanced Chat-Based Matchmaking System Implementation Complete
**Repository Status**: ✅ All Changes Synced to GitHub
**Next Session Instructions**: Review this file, check git log, and ask user what they'd like to work on next.