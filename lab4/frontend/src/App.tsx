import { useEffect, useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count > 30)
      throw new Error("Komputer nie wytrzymał");
  }, [count])

  return (<div className="row">
    <button onClick={() => setCount((count) => count + 1)}>
      Kliknij aby utworzyć kontener
    </button>
    <br />
    <p>Aktualnie działających kontenerów: {count}</p>
  </div>)
}

export default App
