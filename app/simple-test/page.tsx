"use client"

import { useState } from "react"

export default function SimpleTestPage() {
  console.log("🧪 SimpleTestPage: Component rendering...")
  
  const [count, setCount] = useState(0)

  const handleClick = () => {
    console.log("🧪 SimpleTestPage: Button clicked")
    setCount(count + 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🧪 Simple React Test</h1>
        <p className="mb-4">If you can see this, React is working!</p>
        <button 
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Click me! Count: {count}
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Check console for debugging logs
        </p>
      </div>
    </div>
  )
}
