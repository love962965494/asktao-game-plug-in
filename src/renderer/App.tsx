import './App.css'

const Hello = () => {
  const handleBtnClick = () => {}

  return (
    <div>
      <button type="button" onClick={handleBtnClick}>
        点击移动
      </button>
    </div>
  )
}

export default function App() {
  return <Hello />
}
