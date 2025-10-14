import React from 'react';

export default function TailwindTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Tailwind CSS Test - Web App</h1>
      
      {/* Test basic Tailwind utilities */}
      <div className="space-y-2">
        <div className="bg-blue-500 text-white p-4 rounded">Basic Tailwind - Blue Background</div>
        <div className="bg-green-500 text-white p-4 rounded">Basic Tailwind - Green Background</div>
      </div>
      
      {/* Test custom CSS variables */}
      <div className="space-y-2">
        <div className="bg-background text-foreground p-4 rounded border border-border">
          Custom Background & Foreground
        </div>
        <div className="bg-card text-card-foreground p-4 rounded border border-border">
          Custom Card Colors
        </div>
        <div className="bg-primary text-primary-foreground p-4 rounded">
          Custom Primary Colors
        </div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded">
          Custom Secondary Colors
        </div>
        <div className="bg-muted text-muted-foreground p-4 rounded">
          Custom Muted Colors
        </div>
        <div className="bg-accent text-accent-foreground p-4 rounded">
          Custom Accent Colors
        </div>
        <div className="bg-destructive text-destructive-foreground p-4 rounded">
          Custom Destructive Colors
        </div>
      </div>
      
      {/* Test chart colors */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-chart-1 text-white p-2 rounded text-center text-sm">Chart 1</div>
        <div className="bg-chart-2 text-white p-2 rounded text-center text-sm">Chart 2</div>
        <div className="bg-chart-3 text-white p-2 rounded text-center text-sm">Chart 3</div>
        <div className="bg-chart-4 text-white p-2 rounded text-center text-sm">Chart 4</div>
        <div className="bg-chart-5 text-white p-2 rounded text-center text-sm">Chart 5</div>
      </div>
      
      {/* Test border radius */}
      <div className="space-y-2">
        <div className="bg-blue-500 text-white p-4 rounded-sm">Small Radius</div>
        <div className="bg-blue-500 text-white p-4 rounded-md">Medium Radius</div>
        <div className="bg-blue-500 text-white p-4 rounded-lg">Large Radius</div>
      </div>
      
      {/* Test dark mode toggle */}
      <button 
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        Toggle Dark Mode
      </button>
    </div>
  );
}
