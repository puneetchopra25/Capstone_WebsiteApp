# PureSim - Renewable Energy Assessment Tool for Mine Sites

PureSim is a web-based simulator designed to assess renewable energy potential for mine sites. It provides analysis tools for Solar, Wind, and Hydro energy sources with interactive visualizations and detailed reports.

## Features

- **Multi-Energy Source Analysis**

  - Solar Energy Assessment
  - Wind Energy Assessment
  - Hydro Energy Assessment

- **Interactive Visualizations**

  - Energy production charts
  - Cost analysis graphs
  - Flow rate comparisons
  - Power curves
  - Weibull distributions

- **Report Generation**
  - PDF export functionality
  - Detailed analysis results
  - Graphical representations

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Mapbox account for geographical features

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd puresim
```

2. Install dependencies:

```bash
npm install
```

3. Environment Setup:

Create a `.env` file in the root directory with the following variables:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

To get your Mapbox access token:

1. Sign up/Login at [Mapbox](https://www.mapbox.com/)
2. Navigate to Account → Tokens
3. Create a new token or use the default public token
4. Copy the token to your `.env` file

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use)

## Project Structure

```

## Key Dependencies

- **React**: Frontend framework
- **Chart.js & react-chartjs-2**: Data visualization
- **Mapbox GL**: Geographic mapping
- **html2canvas & jsPDF**: PDF generation
- **Tailwind CSS**: Styling
- **Vite**: Build tool and development server

## Environment Variables

The application uses the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_MAPBOX_ACCESS_TOKEN | Mapbox API access token | Yes |

## Notes

- Ensure all environment variables are properly set before running the application
- The Mapbox token should have appropriate permissions for the features you're using
- For development, you can use the default public token, but for production, create a restricted token


```
