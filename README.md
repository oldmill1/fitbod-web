# Fitbod Web App

Upload screenshots of your
workout summaries and get intelligent insights and analysis.

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Modern full-stack web framework
- **Language**: TypeScript - Type-safe JavaScript
- **Styling**: SCSS with CSS Modules - Modular and maintainable styles
- **Build Tool**: Vite - Lightning-fast development and build
- **Package Manager**: npm - Node package management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitbod-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📝 Available Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build production version                 |
| `npm run preview` | Preview production build locally         |
| `npm run check`   | Run TypeScript and Svelte checks         |
| `npm run format`  | Format code with Prettier                |
| `npm run lint`    | Check code formatting                    |

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── UploadForm/          # Main upload component
│   │       ├── UploadForm.svelte
│   │       └── UploadForm.module.scss
│   ├── styles/
│   │   ├── _variables.scss      # Design system variables
│   │   └── reset.css           # CSS reset
│   └── assets/                 # Static assets
├── routes/
│   ├── +layout.svelte          # App layout
│   └── +page.svelte           # Home page
└── app.html                   # HTML template
```

## 🎨 Design System

The app uses a comprehensive design system with:

- **Typography**: Work Sans font family with various weights
- **Colors**: iOS-inspired dark theme palette
- **Spacing**: Consistent 4px base unit system
- **Border Radius**: Multiple radius options for different elements
- **Shadows**: Subtle depth with multiple shadow levels
- **Transitions**: Smooth animations for better UX

### Key Design Tokens

```scss
// Colors
$color-bg-primary: #1c1c1e; // Main background
$color-accent: #007aff; // iOS blue accent
$color-text-primary: #ffffff; // Primary text

// Spacing
$spacing-sm: 0.5rem; // 8px
$spacing-md: 1rem; // 16px
$spacing-lg: 1.5rem; // 24px
```

## 📱 Responsive Design

The application is fully responsive with:

- **Desktop**: Optimal experience with large upload area
- **Tablet**: Adapted layout for touch interactions
- **Mobile**: Compact design with finger-friendly targets

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ♿ Accessibility Features

- **Keyboard Navigation**: Full app accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Color Contrast**: WCAG AA compliant color combinations

## 🔧 Development

### Code Style

- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety throughout
- **SCSS Modules**: Scoped component styles
- **ESLint**: Code quality enforcement

### Adding New Components

1. Create component directory in `src/lib/components/`
2. Add `.svelte` file with TypeScript script
3. Create `.module.scss` for styles
4. Import design tokens from `_variables.scss`

### Styling Guidelines

- Use CSS Modules for component isolation
- Import design tokens from `_variables.scss`
- Follow BEM naming convention
- Use semantic HTML elements

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

The app uses `@sveltejs/adapter-auto` which supports:

- **Vercel**: Zero-config deployment
- **Netlify**: Automatic builds from Git
- **Node.js**: Server-side rendering
- **Static Sites**: Pre-rendered static files

For specific platforms, switch to appropriate adapters:

```bash
npm install @sveltejs/adapter-vercel
npm install @sveltejs/adapter-netlify
npm install @sveltejs/adapter-node
npm install @sveltejs/adapter-static
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add TypeScript types for new functionality
- Write component tests for new features
- Update documentation for significant changes
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚡ Performance

- **Bundle Size**: Optimized with Vite tree-shaking
- **Loading**: Lazy loading for optimal performance
- **Caching**: Efficient browser caching strategies
- **Images**: Automatic image optimization

## 🔮 Roadmap

- [ ] AI-powered workout analysis
- [ ] Progress tracking and visualization
- [ ] Export analysis reports
- [ ] User accounts and history
- [ ] Mobile app companion
- [ ] Integration with fitness APIs

## 📞 Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: [Contact maintainers]

---

**Note**: This application is not affiliated with Fitbod.me. It's an independent tool for analyzing workout data.