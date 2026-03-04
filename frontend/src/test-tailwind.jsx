import React from 'react'

const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Card 1
            </h2>
            <p className="text-gray-600 mb-4">
              If you can see this styled properly, Tailwind is working!
            </p>
            <button className="btn btn-primary w-full">
              Primary Button
            </button>
          </div>
          
          <div className="card p-6 bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Test Card 2
            </h2>
            <p className="text-green-600 mb-4">
              This card has custom colors and should look different.
            </p>
            <button className="btn btn-secondary w-full">
              Secondary Button
            </button>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Card 3
            </h2>
            <div className="space-y-3">
              <input 
                type="text" 
                className="input" 
                placeholder="Test input field"
              />
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Red Badge
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Green Badge
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Tailwind CSS Configuration Test 🎉
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            If this page looks properly styled with:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
            <li>✅ Blue gradient background</li>
            <li>✅ Proper typography and spacing</li>
            <li>✅ Styled cards with shadows</li>
            <li>✅ Colored buttons and badges</li>
            <li>✅ Responsive grid layout</li>
            <li>✅ Form inputs with focus states</li>
          </ul>
          <p className="mt-6 text-green-600 font-semibold">
            Then Tailwind CSS is working correctly! 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestTailwind
