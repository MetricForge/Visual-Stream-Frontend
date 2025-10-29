# MetricForge - Business Analytics Platform

> Professional analytics platform demonstrating BA methodology and full-stack development capabilities. Features 24+ interactive visualizations, predictive analytics, and real-time productivity insights.

**Live Demo:** [https://metricforge.dev](https://metricforge.dev)

---

## 📊 Overview

MetricForge is a production-grade analytics dashboard built to demonstrate end-to-end business analysis methodology and technical implementation. The platform processes ActivityWatch time-tracking data to provide comprehensive productivity insights through interactive visualizations, predictive modeling, and behavioral pattern analysis.

### Key Features

- **24+ Interactive Visualizations** - Real-time charts including heatmaps, network graphs, trend analysis, and forecasting
- **Predictive Analytics** - Machine learning-based productivity forecasting and anomaly detection
- **Comprehensive Methodology** - Full BA documentation including requirements, user stories, and system design
- **Cloud Architecture** - Serverless infrastructure with Cloudflare Workers and R2 storage
- **Responsive Design** - Mobile-first interface built with Tailwind CSS
- **Real-time Processing** - ETL pipeline handling 100K+ activity records

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI architecture
- **TypeScript** - Type-safe development
- **Recharts** - Data visualization library
- **Tailwind CSS** - Utility-first styling
- **Vite** - Next-generation build tool
- **PapaParse** - CSV parsing for data processing

### Backend & Infrastructure
- **Cloudflare Workers** - Serverless edge computing
- **R2 Storage** - Object storage for data files
- **Python** - ETL pipeline and data processing
- **ActivityWatch** - Time-tracking data source

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- A code editor (VS Code recommended)

### Installation

**1. Clone the repository**

    git clone https://github.com/MetricForge/metricforge-frontend.git
    cd metricforge-frontend

**2. Install dependencies**

    npm install

**3. Set up environment variables**

Create a `.env.local` file in the root directory with:

    VITE_API_BASE_URL=https://data.metricforge.dev
    VITE_CLARITY_PROJECT_ID=your-clarity-project-id
    VITE_CREATOR=Your Name
    VITE_CREATOR_DOMAIN=https://linkedin.com/in/yourprofile
    VITE_START_YEAR=2025
    VITE_GITHUB_URL=https://github.com/MetricForge/metricforge-frontend

**4. Run the development server**

    npm run dev

**5. Open your browser**

Navigate to `http://localhost:5173` to see the application.

---

## 📦 Build & Deploy

### Production Build

    npm run build

This generates optimized static files in the `dist/` directory.

### Preview Production Build

    npm run preview

---

## 📁 Project Structure

    metricforge-frontend/
    ├── public/              # Static assets
    ├── src/
    │   ├── components/      # React components
    │   ├── App.tsx         # Main application
    │   ├── main.tsx        # Entry point
    │   └── index.css       # Global styles
    ├── index.html          # HTML template
    ├── package.json        # Dependencies
    ├── tsconfig.json       # TypeScript config
    ├── tailwind.config.js  # Tailwind config
    ├── vite.config.ts      # Vite config
    └── README.md          # Documentation

---

## 🎨 Key Components

### Visualization Components
- **AWStackEvolution** - Technology stack usage over time
- **AWLanguageHeatmap** - Programming language activity patterns
- **AWProductivityForecast** - Predictive analytics with trend analysis
- **AWAppTransitionNetwork** - Application switching patterns
- **AWAnomalyDetection** - Unusual activity identification
- And 19+ more interactive visualizations...

### Methodology Documentation
- Requirements gathering and stakeholder analysis
- User stories and acceptance criteria
- System architecture and data flow diagrams
- BA methodology and decision-making process

---

## 🔒 Security & Privacy

- Environment variables for sensitive configuration
- CORS protection on API endpoints
- Origin validation on Cloudflare Workers
- No personal data stored or transmitted
- MIT License for open-source transparency

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Your Name**
- LinkedIn: [Kevin Hsueh](https://www.linkedin.com/in/kevinkhsueh/)
- GitHub: [@MetricForge](https://github.com/MetricForge)
- Portfolio: [metricforge.dev](https://metricforge.dev)

---

## 🙏 Acknowledgments

- [ActivityWatch](https://activitywatch.net/) - Time-tracking data source
- [Recharts](https://recharts.org/) - Visualization library
- [Cloudflare](https://www.cloudflare.com/) - Infrastructure platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📊 Project Stats

- **24+ Components** - Modular, reusable React components
- **100K+ Records** - Processed activity data
- **TypeScript** - 100% type coverage
- **Responsive** - Mobile, tablet, and desktop optimized
- **Production Ready** - Deployed on Kinsta with CI/CD

---

**Built with ❤️ for Business Analysis and Data Visualization**
