# Oh My Posh Visual Configurator ✨

<div align="center">

![Oh My Posh Configurator](https://img.shields.io/badge/Oh%20My%20Posh-Visual%20Configurator-e94560?style=for-the-badge)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://jamesmontemagno.github.io/ohmyposh-configurator/)

**Design beautiful terminal prompts without touching configuration files**

[🚀 Launch App](https://jamesmontemagno.github.io/ohmyposh-configurator/) • [📖 Documentation](https://ohmyposh.dev/docs/) • [💬 Discussions](https://github.com/jamesmontemagno/ohmyposh-configurator/discussions)

</div>

---

## 🎯 What is Oh My Posh Configurator?

The **Oh My Posh Visual Configurator** is a modern, intuitive web application that lets you design and customize your terminal prompt visually. No more manual JSON editing or trial-and-error configuration—just drag, drop, customize, and export!

Perfect for developers, DevOps engineers, and anyone who wants a beautiful, informative terminal prompt for PowerShell, Bash, Zsh, Fish, or any shell supported by [Oh My Posh](https://ohmyposh.dev/).

## ✨ Features

- 🎨 **103+ Segments**: Browse comprehensive segment library organized in 8 categories
- 🖱️ **Drag & Drop Interface**: Intuitive visual editor with real-time updates
- ⚡ **Live Preview**: See your prompt instantly with sample data and powerline/diamond styles
- 🎛️ **Full Customization**: Configure colors, templates, styles, and alignment
- 📦 **Import & Export**: Support for JSON, YAML, and TOML formats
- 💾 **Auto-Save**: Never lose your work with automatic browser storage
- 🎯 **Sample Configs**: Start quickly with 6 pre-built professional templates
- 🌐 **100% Client-Side**: Your configurations never leave your browser
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🎨 **Smart Color Schemes**: Category-based default colors for quick setup

## 🗂️ Segment Categories

- **System**: Path, OS, Shell, Session, Battery, Time, Execution Time, Status, and more
- **Version Control**: Git, Mercurial, SVN, Fossil, Plastic SCM, Sapling, Jujutsu
- **Languages**: Node.js, Python, Go, Rust, Java, .NET, PHP, Ruby, Swift, and 20+ more
- **Cloud & Infrastructure**: AWS, Azure, GCP, Kubernetes, Terraform, Docker, Pulumi
- **CLI Tools**: NPM, Yarn, PNPM, Angular, React, Flutter, and many more
- **Web**: IP Address, Weather, HTTP requests
- **Music**: Spotify, YouTube Music, Last.fm
- **Health**: Nightscout, Strava, Withings

## 🚀 Getting Started

### 🌐 Use Online (Recommended)

No installation required! Visit the hosted version:

**👉 [https://jamesmontemagno.github.io/ohmyposh-configurator/](https://jamesmontemagno.github.io/ohmyposh-configurator/)**

### 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/jamesmontemagno/ohmyposh-configurator.git
cd ohmyposh-configurator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Usage

### Quick Start Guide

1. **🎯 Choose a Starting Point**
   - Start from scratch, or
   - Load a sample configuration, or
   - Import your existing Oh My Posh config

2. **➕ Add Segments**
   - Browse categories in the left sidebar
   - Click segments to add them to your prompt
   - Or drag them directly to desired positions

3. **🎨 Customize**
   - Click any segment to edit properties
   - Adjust colors, styles, and templates
   - Configure powerline, diamond, or plain styles

4. **👀 Preview**
   - See changes instantly in the preview panel
   - Toggle between dark and light backgrounds
   - View powerline arrows and diamond shapes

5. **💾 Export**
   - Choose your format: JSON, YAML, or TOML
   - Download and use with Oh My Posh

### 🔧 Using Your Configuration

After downloading your configuration file, follow the [Oh My Posh installation guide](https://ohmyposh.dev/docs/installation/customize) to use it with your shell:

```bash
# PowerShell
oh-my-posh init pwsh --config ~/your-theme.json | Invoke-Expression

# Bash
eval "$(oh-my-posh init bash --config ~/your-theme.json)"

# Zsh
eval "$(oh-my-posh init zsh --config ~/your-theme.json)"
```

## 🛠️ Technology Stack

- **⚛️ Framework**: React 19 with TypeScript
- **⚡ Build Tool**: Vite 6.4
- **🎨 Styling**: Tailwind CSS 4.1
- **🖱️ Drag & Drop**: @dnd-kit
- **💾 State Management**: Zustand with persistence
- **🎯 Icons**: Lucide React (500+ icons)
- **📝 Config Parsing**: js-yaml, @iarna/toml

## 🔍 SEO & Sharing

This project includes comprehensive SEO optimization:
- ✅ Structured data (JSON-LD) for search engines
- ✅ Open Graph tags for rich social media previews
- ✅ Twitter Card support
- ✅ PWA manifest for "Add to Home Screen"
- ✅ Sitemap and robots.txt
- ✅ Semantic HTML with proper meta tags

## 🌟 Keywords

`oh my posh`, `terminal customization`, `shell prompt`, `powerline`, `prompt theme`, `terminal theme`, `powershell prompt`, `zsh theme`, `bash prompt`, `terminal configurator`, `visual editor`, `drag and drop`, `oh-my-posh builder`, `prompt generator`

## 📚 Documentation

- [Oh My Posh Documentation](https://ohmyposh.dev/docs/)
- [Configuration Overview](https://ohmyposh.dev/docs/configuration/overview)
- [Segment Reference](https://ohmyposh.dev/docs/configuration/segment)
- [Template Syntax](https://ohmyposh.dev/docs/configuration/templates)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Oh My Posh](https://github.com/JanDeDobbeleer/oh-my-posh) by Jan De Dobbeleer
- All the Oh My Posh contributors and community
