# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a WeChat Mini Program (微信小程序) called "灵狐复盘" (Linghu Review), which is designed to help users track and analyze their personal growth experiences. The application allows users to record and review their experiences, with features for statistics and historical tracking.

## Codebase Structure
- `miniprogram/` - Main application directory
  - `app.js` - Application entry point with global data and initialization
  - `app.json` - Application configuration (pages, window style, tab bar)
  - `app.wxss` - Global styles
  - `pages/` - Directory containing all page components
    - `index/` - Home page
    - `create/` - Review creation page
    - `history/` - Review history page
    - `detail/` - Review detail page
    - `statistics/` - Statistics page
    - `profile/` - User profile page
  - `utils/` - Utility functions and common styles

## Development Environment
This is a WeChat Mini Program project that uses:
- WeChat Cloud Development (云开发) for backend services
- WXML (WeiXin Markup Language) for templates
- WXSS (WeiXin Style Sheets) for styling
- JavaScript for logic

## Common Development Tasks

### Building and Running
1. Open the project in WeChat Developer Tools
2. Configure the cloud environment ID in `app.js` (CLOUD_ENV_ID)
3. Build and preview using WeChat Developer Tools

### Working with Pages
Each page consists of four files:
- `.js` - Page logic
- `.wxml` - Page structure/template
- `.wxss` - Page styles
- `.json` - Page configuration

### Cloud Development
The app uses WeChat Cloud Development for:
- Database operations
- Cloud functions
- File storage

## Architecture Overview
The application follows a standard WeChat Mini Program structure:
1. Global app configuration in `app.json`
2. Tab-based navigation with 4 main sections (Home, History, Statistics, Profile)
3. Cloud-based data storage and retrieval
4. User authentication via WeChat login

## Key Components
- User authentication and session management
- Review creation and storage
- Historical review tracking
- Statistics generation
- Profile management

## Testing
Testing is done through WeChat Developer Tools which provides:
- Simulator for different device sizes
- Debugger for JavaScript
- Network request monitoring
- Cloud development tools

## Deployment
Deployment is handled through WeChat Developer Tools:
1. Upload the code version
2. Submit for review in WeChat Mini Program Management Console
3. Release after approval