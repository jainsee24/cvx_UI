
## Features

- 3D visualization of parallelepipeds using Three.js.
- Controls to translate, rotate, and scale each parallelepiped.
- Interaction via mouse click to select a parallelepiped.
- Synthesizing and saving modifications to a JSON file.

## Project Structure

```bash
.
├── public
│   ├── data.json          # Initial data for parallelepipeds
│   └── modified_data.json # File where modified parallelepiped data will be saved
├── src
│   ├── main.js            # Main JavaScript file for Three.js code
│   └── helpers.js         # Helper functions
├── index.html             # Main HTML file with canvas and control sliders
├── package.json           # Project dependencies and scripts
└── README.md              # This README file
```

## Installation

### Prerequisites

Ensure that you have the following installed on your system:

- **Node.js** (v14.x or higher) and **npm** (v6.x or higher).
- **Vite** for development.

### Steps

1. **Clone the Repository**

   Clone this repository to your local machine:

   ```bash
   git clone https://github.com/jainsee24/cvx_UI.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd cvx_UI
   ```

3. **Install Dependencies**

   Install the necessary dependencies using npm:

   ```bash
   npm install
   ```

## Running the Project

To run the project locally, you can use Vite's development server:

1. **Start the Development Server**

   Run the following command:

   ```bash
   npm run dev
   ```

   This will start a local development server, and you should see output similar to:

   ```
   VITE v2.x.x  ready in xx ms

   Local: http://localhost:3000/
   ```

2. **Open the Application in Your Browser**

   Navigate to `http://localhost:3000/` in your browser to view and interact with the Three.js scene.

## Synthesizing Changes

The "Synthesize" button in the UI allows you to save modifications (translation, rotation, scaling) made to the selected parallelepiped into a `modified_data.json` file.

The default data is loaded from `public/data.json`. Once modifications are made, the updated parallelepiped data will be saved to `public/modified_data.json`.

## Building for Production

To build the project for production, run:

```bash
npm run build
```

This will generate the optimized static files in the `dist` folder.
