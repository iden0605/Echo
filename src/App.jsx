import Chat from './components/mainpage/chat/Chat';
import Header from './components/mainpage/Header';

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <Chat />
      </div>
    </div>
  )
}

export default App
