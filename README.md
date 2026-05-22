# 5G PRACH Analyzer

A modern React single-page application for analyzing and visualizing 5G NR PRACH (Physical Random Access Channel) concepts, ALOHA protocol variations, and random access methods.

## Features

- **ALOHA Calculator**: Compare Pure and Slotted ALOHA protocol performance
- **PRACH Analyzer**: Analyze preamble collision probability and throughput
- **Latency Calculator**: Compare 4-step and 2-step RACH procedures
- **Grant-free RA**: Explore massive machine-type communication (mMTC) and IoT scenarios
- **Comparison Tool**: Compare all random access methods side-by-side
- **Interactive Charts**: Real-time visualization using Recharts
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Multi-language Support**: Interface in Uzbek language

## Tech Stack

- **React 18**: Modern UI framework
- **React Router v6**: Client-side routing
- **Recharts**: Interactive charting library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Lightning-fast build tool
- **Lucide React**: Modern icon library

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx        # Fixed top navigation with mobile menu
│   └── Footer.jsx        # Footer with copyright info
├── pages/
│   ├── Home.jsx          # Landing page with feature cards
│   ├── AlohaCalculator.jsx    # ALOHA protocol comparison
│   ├── PRACHAnalyzer.jsx      # PRACH analysis
│   ├── LatencyCalculator.jsx  # Latency comparison
│   ├── GrantFreeRA.jsx        # Grant-free scenarios
│   └── Comparison.jsx    # All methods comparison
├── App.jsx               # Main app with routing
├── main.jsx              # React entry point
├── App.css               # App-level styles
└── index.css             # Tailwind CSS directives
```

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## Building

Build for production:

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

## Routes

- `/` - Home page
- `/aloha` - ALOHA Calculator
- `/prach` - PRACH Analyzer
- `/latency` - Latency Calculator
- `/grantfree` - Grant-free RA
- `/comparison` - All methods comparison

## Features Details

### Home Page
- Hero section with project title and description
- 6 feature cards with icons and quick links
- Key statistics showcasing system parameters

### ALOHA Calculator
- Interactive sliders to adjust Pure and Slotted ALOHA usage
- Real-time efficiency calculations
- Line chart comparing protocol performance

### PRACH Analyzer
- Statistical overview of preamble system
- Bar chart showing collision and throughput rates
- Analysis for up to 64 preambles

### Latency Calculator
- Compare 4-step and 2-step RACH procedures
- Success rate tracking
- Visual comparison of latency metrics

### Grant-free RA
- Toggle between mMTC and IoT scenarios
- Pie chart showing success rates
- Feature list highlighting advantages

### Comparison Tool
- Comprehensive comparison table
- Efficiency comparison chart
- Latency comparison chart
- Recommendations for each method

## Styling

The application uses Tailwind CSS for styling with a custom blue primary color (#1565C0). All components are responsive and work seamlessly on mobile, tablet, and desktop devices.

### Key Colors
- Primary: `#1565C0` (Blue)
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)
- Warning: `#F59E0B` (Amber)

## Responsive Design

- Fixed Navbar with hamburger menu for mobile
- Grid layouts that adapt to screen size
- Touch-friendly interactive elements
- Optimized chart visualization for all devices

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project is open source and available for educational purposes.

## References

Based on 3GPP TS 38.211 specifications for 5G NR PRACH procedures.

---

**Last Updated**: 2025
