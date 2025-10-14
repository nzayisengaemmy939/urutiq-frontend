export default function MinimalPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'red' }}>🧪 Minimal Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <div style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '10px', 
        margin: '10px 0',
        borderRadius: '5px'
      }}>
        This is a simple test without any external dependencies.
      </div>
      <a href="/" style={{ color: 'green', textDecoration: 'underline' }}>
        Go back to home
      </a>
    </div>
  )
}
